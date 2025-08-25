import cv2
import numpy as np
import argparse
import os
import sys
import traceback

def rgb_to_hex(rgb):
    """Converts an RGB tuple to a hex string."""
    return f'{int(rgb[0]):02x}{int(rgb[1]):02x}{int(rgb[2]):02x}'

def frame_to_svg_color(frame, num_colors=16):
    """
    Converts a single video frame (numpy array) to a color SVG string using OpenCV's k-means.
    """
    if frame is None:
        raise ValueError("Input frame is empty")

    height, width, _ = frame.shape

    # OpenCV uses BGR, convert to RGB for correct color representation in SVG.
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pixels = frame_rgb.reshape((-1, 3))
    pixels_float = np.float32(pixels)

    # Use OpenCV's k-means implementation
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    attempts = 3 # Use fewer attempts for speed
    compactness, labels, palette = cv2.kmeans(pixels_float, num_colors, None, criteria, attempts, cv2.KMEANS_PP_CENTERS)

    # Create the quantized image
    quantized_frame_rgb = palette[labels.flatten()].reshape(frame.shape).astype('uint8')
    
    # Convert back to BGR for OpenCV contour finding.
    quantized_frame_bgr = cv2.cvtColor(quantized_frame_rgb, cv2.COLOR_RGB2BGR)

    # Generate SVG.
    svg_header = f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">\n'
    svg_elements = []

    for color in palette:
        hex_color = rgb_to_hex(color)
        # Convert palette color (RGB) to BGR for mask creation.
        color_bgr = np.array(color[::-1], dtype=np.uint8)
        
        mask = cv2.inRange(quantized_frame_bgr, color_bgr, color_bgr)
        
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            if cv2.contourArea(contour) > 1:
                path_data = "M" + "L".join([f"{p[0][0]},{p[0][1]}" for p in contour]) + "Z"
                svg_elements.append(f'  <path d="{path_data}" fill="#{hex_color}" />\n')

    svg_footer = '</svg>'
    return svg_header + "".join(svg_elements) + svg_footer

def process_image(image_path, output_path, num_colors):
    try:
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not read image from {image_path}", file=sys.stderr)
            return
        
        print(f"Processing image with {num_colors} colors...")
        svg_content = frame_to_svg_color(image, num_colors)
        
        with open(output_path, 'w') as f:
            f.write(svg_content)
        print(f"Color SVG file saved to {output_path}")

    except Exception as e:
        print(f"An error occurred during image processing: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

def process_video(video_path, output_dir, num_colors):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file {video_path}", file=sys.stderr)
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0: fps = 30

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            print(f"Created output directory: {output_dir}")

        frame_num = 0
        saved_frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            if frame_num % int(fps) == 0:
                print(f"Processing frame {frame_num}...")
                svg_content = frame_to_svg_color(frame, num_colors)
                output_svg_path = os.path.join(output_dir, f"frame_{saved_frame_count:04d}.svg")
                with open(output_svg_path, 'w') as f:
                    f.write(svg_content)
                print(f"  -> Saved {output_svg_path}")
                saved_frame_count += 1
            
            frame_num += 1

        cap.release()
        print(f"\nVideo processing complete. Saved {saved_frame_count} SVG frames to {output_dir}.")

    except Exception as e:
        print(f"An error occurred during video processing: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert an image or video to a color cartoon-style SVG.')
    parser.add_argument('input', help='Path to the input image or video file.')
    parser.add_argument('--output', help='Path to the output file (for images) or directory (for videos).')
    parser.add_argument('--colors', type=int, default=16, help='Number of colors to use in the SVG palette (e.g., 8, 16, 32).')

    args = parser.parse_args()

    input_path = args.input
    video_extensions = ['.mov', '.mp4', '.avi', '.mkv', '.webm']
    image_extensions = ['.png', '.jpg', '.jpeg', '.bmp', '.webp']
    input_ext = os.path.splitext(input_path)[1].lower()

    if input_ext in video_extensions:
        output_dir = args.output or os.path.join(os.path.dirname(input_path), os.path.splitext(os.path.basename(input_path))[0] + "_svg_frames_color")
        process_video(input_path, output_dir, args.colors)
    elif input_ext in image_extensions:
        output_path = args.output or os.path.splitext(input_path)[0] + ".svg"
        process_image(input_path, output_path, args.colors)
    else:
        print(f"Error: Unsupported file type '{input_ext}'.", file=sys.stderr)
        sys.exit(1)
