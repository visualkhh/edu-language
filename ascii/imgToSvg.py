import cv2
import numpy as np
import argparse
import os
import sys
import traceback
import json

# Define available character sets
CHAR_SETS = {
    'minimal': " .", # 2 characters
    'tiny': " .:=+", # 5 characters
    'basic': " .:-=+*#%@", # 9 characters
    'medium': " .:-=+*#%@&$BPHWM", # 16 characters
    'detailed': r"""$@B%&WM#oahkbdpqwmZQLCJYxzcvunxrjft/\|()[]?-_+~<>i!lI;:,"^'. """, # 67 characters (removed 0, 1, 8)
    'blocks': "█▓▒░ ", # 4 characters
}
# Reverse the ramps so that dark pixels (0) map to the first characters (visually darker)
for key in CHAR_SETS:
    CHAR_SETS[key] = CHAR_SETS[key][::-1]

def rle_encode(s):
    """Encodes a string using Run-Length Encoding with char_count format (no separator)."""
    if not s:
        return ""
    
    encoded_parts = []
    i = 0
    while i < len(s):
        char = s[i]
        count = 1
        j = i + 1
        while j < len(s) and s[j] == char:
            count += 1
            j += 1
        
        if count > 1:
            encoded_parts.append(f"{char}{count}") # No separator needed as no digits in charsets
        else:
            encoded_parts.append(char)
        i = j
    return "".join(encoded_parts)

def frame_to_ascii_object(frame, width=100, char_ramp=CHAR_SETS['basic'], high_contrast=False, enable_color=False, compression_type='none'):
    """Converts a single frame to an object containing ASCII art content, colors (optional), and its metadata."""
    if frame is None: raise ValueError("Input frame is empty")

    (h, w) = frame.shape[:2]
    aspect_ratio = h / float(w)
    new_height = int(width * aspect_ratio)

    resized_frame = cv2.resize(frame, (width, new_height))
    gray_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2GRAY)

    if high_contrast:
        gray_frame = cv2.bitwise_not(gray_frame)
        _, threshold_frame = cv2.threshold(gray_frame, 150, 255, cv2.THRESH_BINARY)
        char_ramp = " #"
        gray_frame = threshold_frame

    ascii_rows = []
    ascii_colors = [] if enable_color else None # Only create if color is enabled
    for i in range(new_height):
        row_chars = []
        row_colors = [] if enable_color else None
        for j in range(width):
            pixel_intensity = gray_frame[i, j]
            char_index = min(int(pixel_intensity / 255 * (len(char_ramp))), len(char_ramp) - 1)
            row_chars.append(char_ramp[char_index])

            if enable_color:
                pixel_color = resized_frame[i, j].tolist()
                row_colors.append(pixel_color)

        ascii_rows.append("".join(row_chars))
        if enable_color:
            ascii_colors.append(row_colors)

    rows_count = len(ascii_rows)
    cols_count = max(len(r) for r in ascii_rows) if ascii_rows else 0
    
    content = "\n".join(ascii_rows)
    if compression_type == 'rle':
        content = rle_encode(content)
    
    result = {"content": content, "width": cols_count, "height": rows_count}
    if enable_color:
        result["colors"] = ascii_colors
    return result


def save_ascii_as_image(ascii_obj, output_image_path, font_scale=0.5, thickness=1, color=(0, 0, 0), bg_color=(255, 255, 255), target_pixel_width=None, target_pixel_height=None):
    """
    Renders ASCII art object to an image file, fitting to a target pixel resolution exactly,
    potentially distorting the ASCII art's aspect ratio.
    """
    content = ascii_obj["content"]
    ascii_rows = content.split('\n')
    ascii_width_chars = ascii_obj["width"]
    ascii_height_chars = ascii_obj["height"]

    font = cv2.FONT_HERSHEY_PLAIN

    # Get the size of a single character (e.g., 'M') at a base font_scale (e.g., 1.0)
    base_font_scale = 1.0
    (base_text_width, base_text_height), base_baseline = cv2.getTextSize("M", font, base_font_scale, thickness)
    
    # Determine the final image dimensions and font_scale
    if target_pixel_width is not None and target_pixel_height is not None:
        # Calculate font_scale based on target width to render an intermediate image
        # This will be the primary scaling factor for the initial rendering
        font_scale_for_initial_render = (target_pixel_width / ascii_width_chars) / base_text_width * base_font_scale
        
        # Render the ASCII art with this font_scale
        (text_width_rendered, text_height_rendered), baseline_rendered = cv2.getTextSize("M", font, font_scale_for_initial_render, thickness)
        char_pixel_size_rendered = text_width_rendered

        # Calculate image dimensions based on rendered characters
        rendered_image_width = ascii_width_chars * char_pixel_size_rendered
        rendered_image_height = ascii_height_chars * char_pixel_size_rendered

        # Create a blank image with background color
        img = np.full((rendered_image_height, rendered_image_width, 3), bg_color, dtype=np.uint8)

        # Determine if color information is available
        color_enabled_in_obj = "colors" in ascii_obj

        # Draw each character
        for i, line in enumerate(ascii_rows):
            for j, char in enumerate(line):
                x = j * char_pixel_size_rendered
                y = i * char_pixel_size_rendered + (char_pixel_size_rendered - text_height_rendered) // 2 + text_height_rendered - baseline_rendered
                
                if color_enabled_in_obj:
                    char_color = ascii_obj["colors"][i][j]
                else:
                    char_color = color # Use default color if not enabled

                cv2.putText(img, char, (x, y), font, font_scale_for_initial_render, char_color, thickness, cv2.LINE_AA)

        # Resize the image to the exact target dimensions
        final_img = cv2.resize(img, (target_pixel_width, target_pixel_height), interpolation=cv2.INTER_AREA)
        image_width = target_pixel_width
        image_height = target_pixel_height

    else:
        # Original logic: Use provided font_scale to determine image dimensions
        final_font_scale = font_scale
        (text_width, text_height), baseline = cv2.getTextSize("M", font, final_font_scale, thickness)
        final_char_pixel_size = text_width

        image_width = ascii_width_chars * final_char_pixel_size
        image_height = ascii_height_chars * final_char_pixel_size
        
        # Create a blank image
        final_img = np.full((image_height, image_width, 3), bg_color, dtype=np.uint8)

        # Determine if color information is available
        color_enabled_in_obj = "colors" in ascii_obj

        # Draw each character
        for i, line in enumerate(ascii_rows):
            for j, char in enumerate(line):
                x = j * final_char_pixel_size
                y = i * final_char_pixel_size + (final_char_pixel_size - text_height) // 2 + text_height - baseline
                
                if color_enabled_in_obj:
                    char_color = ascii_obj["colors"][i][j]
                else:
                    char_color = color # Use default color if not enabled

                cv2.putText(final_img, char, (x, y), font, final_font_scale, char_color, thickness, cv2.LINE_AA)

    cv2.imwrite(output_image_path, final_img)
    print(f"Successfully saved ASCII image to {output_image_path} with resolution {image_width}x{image_height}")

def process_image(image_path, output_json_path, width, char_ramp, high_contrast, export_image=False, output_image_path=None, enable_color=False, compression_type='none'):
    """Converts a single image to a JSON file containing the ASCII art object and optionally an image."""
    try:
        image = cv2.imread(image_path)
        if image is None: raise ValueError(f"Could not read image: {image_path}")
        
        # Get original image dimensions
        original_h, original_w = image.shape[:2]

        print(f"Processing image '{os.path.basename(image_path)}'...")
        ascii_obj = frame_to_ascii_object(image, width, char_ramp, high_contrast, enable_color, compression_type)
        
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(ascii_obj, f, indent=2)
            
        print(f"Successfully saved ASCII data to {output_json_path}")

        if export_image:
            if output_image_path is None:
                base_name = os.path.splitext(image_path)[0]
                output_image_path = base_name + "_ascii.png"
            
            # Pass original image dimensions to save_ascii_as_image
            save_ascii_as_image(ascii_obj, output_image_path, target_pixel_width=original_w, target_pixel_height=original_h)

    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

def process_video(video_path, output_dir, width, char_ramp, high_contrast, export_image=False, output_image_dir=None, enable_color=False, frame_interval=1.0, compression_type='none'):
    """Converts a video to a sequence of JSON files, one for each sampled frame, and optionally images."""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened(): raise ValueError(f"Could not open video: {video_path}")
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            print(f"Created output directory: {output_dir}")

        if export_image and output_image_dir is None:
            output_image_dir = os.path.join(output_dir, "images") # Default image output directory for video frames
        
        if export_image and not os.path.exists(output_image_dir):
            os.makedirs(output_image_dir)
            print(f"Created image output directory: {output_image_dir}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        # Calculate frame skip based on desired frame_interval
        frame_skip = max(1, int(fps * frame_interval))
        print(f"Processing video '{os.path.basename(video_path)}' at ~{1.0/frame_interval:.1f} FPS (sampling every {frame_skip} frames)...")
        
        frame_num = 0
        saved_count = 0
        metadata_frames = [] # List to store metadata for each frame
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            # Get original frame dimensions
            original_h, original_w = frame.shape[:2]

            if frame_num % frame_skip == 0:
                print(f"  - Processing frame {frame_num}...")
                ascii_obj = frame_to_ascii_object(frame, width, char_ramp, high_contrast, enable_color, compression_type)
                
                output_json_filename = f"frame_{saved_count:04d}.json"
                output_json_path = os.path.join(output_dir, output_json_filename)
                
                with open(output_json_path, 'w', encoding='utf-8') as f:
                    json.dump(ascii_obj, f, indent=2)
                
                if export_image:
                    output_image_filename = f"frame_{saved_count:04d}.png"
                    frame_output_image_path = os.path.join(output_image_dir, output_image_filename)
                    # Pass original frame dimensions to save_ascii_as_image
                    save_ascii_as_image(ascii_obj, frame_output_image_path, target_pixel_width=original_w, target_pixel_height=original_h)
                
                # Calculate time for this frame in milliseconds
                current_time_ms = int((frame_num / fps) * 1000)
                metadata_frames.append({"path": output_json_filename, "time_ms": current_time_ms})
                
                saved_count += 1
            
            frame_num += 1
            
        cap.release()
        
        # Write metadata JSON file
        metadata_file_path = os.path.join(output_dir, "metadata.json")
        
        total_duration_ms = 0
        if metadata_frames:
            # The total duration is the time of the last frame plus its interval
            total_duration_ms = metadata_frames[-1]["time_ms"] + int(frame_interval * 1000)

        with open(metadata_file_path, 'w', encoding='utf-8') as f:
            metadata_content = {
                "frames": metadata_frames,
                "frame_interval_ms": int(frame_interval * 1000),
                "total_duration_ms": total_duration_ms
            }
            if compression_type != 'none':
                metadata_content["compression_type"] = compression_type
            json.dump(metadata_content, f, indent=2)
        print(f"Successfully saved metadata to {metadata_file_path}")
        
        print(f"\nProcessing complete. Saved {saved_count} frames to {output_dir}\n")
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert an image or video to ASCII art JSON data file(s).')
    parser.add_argument('input', help='Path to the input image or video file.')
    parser.add_argument('--output', help='Path to the output file (for images) or directory (for videos). ')
    parser.add_argument('--width', type=int, default=150, help='Initial character width of the ASCII art.')
    parser.add_argument('--charset', choices=list(CHAR_SETS.keys()), default='basic', help='Pre-defined character set.')
    parser.add_argument('--custom-charset', type=str, help='A custom string of characters to use as a ramp.')
    parser.add_argument('--high-contrast', action='store_true', help='Use high-contrast mode.')
    parser.add_argument('--export-image', action='store_true', help='Export ASCII art as an image file (PNG).')
    parser.add_argument('--output-image', type=str, help='Path to the output ASCII image file (for images) or directory (for video frames). If not provided, defaults to <input_basename>_ascii.png or <output_dir>/images/ for video.') # New argument
    parser.add_argument('--color', action='store_true', help='Enable color processing for ASCII art.')
    parser.add_argument('--frame-interval', type=float, default=1.0, help='Interval in seconds between sampled frames for video processing.')
    parser.add_argument('--compression-type', choices=['none', 'rle'], default='none', help='Type of compression to apply to ASCII content.')
    args = parser.parse_args()

    if args.custom_charset:
        char_ramp = args.custom_charset
    elif args.high_contrast:
        char_ramp = "# "
    else:
        char_ramp = CHAR_SETS[args.charset]

    input_ext = os.path.splitext(args.input)[1].lower()
    video_extensions = ['.mov', '.mp4', '.avi', '.mkv', '.webm']
    image_extensions = ['.png', '.jpg', '.jpeg', '.bmp', '.webp']

    if input_ext in video_extensions:
        output_dir = args.output or os.path.splitext(args.input)[0] + "_frames"
        process_video(args.input, output_dir, args.width, char_ramp, args.high_contrast, args.export_image, args.output_image, args.color, args.frame_interval, args.compression_type)
    elif input_ext in image_extensions:
        output_path = args.output or os.path.splitext(args.input)[0] + ".json"
        process_image(args.input, output_path, args.width, char_ramp, args.high_contrast, args.export_image, args.output_image, args.color, args.compression_type)
    else:
        print(f"Error: Unsupported file type '{input_ext}'.", file=sys.stderr)
        sys.exit(1)
