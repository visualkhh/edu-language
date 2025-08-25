import cv2
import numpy as np
import argparse
import os
import sys
import traceback
import json
import subprocess
import re
import shutil

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

def rgb_to_hex(rgb_list):
    """Converts a BGR list to a hex color string RRGGBB (without # prefix)."""
    b, g, r = rgb_list
    return f"{r:02X}{g:02X}{b:02X}"

def rle_encode_color_row(color_row):
    """Encodes a single row of hex color strings using RLE."""
    if not color_row:
        return []
    
    encoded_parts = []
    i = 0
    while i < len(color_row):
        color = color_row[i]
        count = 1
        j = i + 1
        while j < len(color_row) and color_row[j] == color:
            count += 1
            j += 1
        
        if count > 1:
            encoded_parts.append(f"{color}_{count}")
        else:
            encoded_parts.append(color) # Only append color if count is 1
        i = j
    return encoded_parts

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
                row_colors.append(rgb_to_hex(pixel_color)) # Convert to hex string

        ascii_rows.append("".join(row_chars))
        if enable_color:
            if compression_type == 'rle':
                ascii_colors.append(rle_encode_color_row(row_colors)) # RLE encode color row
            else:
                ascii_colors.append(row_colors)

    rows_count = len(ascii_rows)
    cols_count = max(len(r) for r in ascii_rows) if ascii_rows else 0
    
    content = "\n".join(ascii_rows) # Use \n for JSON string literal
    if compression_type == 'rle':
        content = rle_encode(content)
    
    result = {"content": content, "width": cols_count, "height": rows_count}
    if enable_color:
        result["colors"] = ascii_colors
    return result

def time_str_to_ms(time_str):
    """Converts a time string (HH:MM:SS.mmm) to milliseconds."""
    parts = re.split(r'[:.]', time_str)
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = int(parts[2])
    milliseconds = int(parts[3])
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds

def parse_vtt(vtt_file_path):
    """Parses a VTT file and returns a list of subtitle entries with start_ms, end_ms, and text."""
    subtitles_list = []
    with open(vtt_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    cue_blocks = re.split(r'\n\n(?=\d{2}:\d{2}:\d{2}\.\d{3})', content)

    for block in cue_blocks:
        lines = block.strip().split('\n')
        if not lines:
            continue

        time_match = re.match(r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})', lines[0])
        if time_match:
            start_time_str, end_time_str = time_match.groups()
            start_ms = time_str_to_ms(start_time_str)
            end_ms = time_str_to_ms(end_time_str)

            raw_text_lines = [line.strip() for line in lines[1:] if line.strip()]

            # Filter out consecutive duplicate lines
            filtered_text_lines = []
            for line in raw_text_lines:
                # Remove HTML tags and timestamps from the line before checking for duplicates
                cleaned_line = re.sub(r'<[^>]+>', '', line)
                cleaned_line = re.sub(r'\d{2}:\d{2}:\d{2}\.\d{3}', '', cleaned_line)
                cleaned_line = cleaned_line.strip()

                if not filtered_text_lines or cleaned_line != filtered_text_lines[-1]:
                    filtered_text_lines.append(cleaned_line)

            subtitle_text = '\n'.join(filtered_text_lines)
            subtitle_text = subtitle_text.strip() # Final strip after joining

            if subtitle_text:
                subtitles_list.append({
                    'start_ms': start_ms,
                    'end_ms': end_ms,
                    'text': subtitle_text
                })
    return subtitles_list


def process_youtube_video(youtube_url, output_dir, width, char_ramp, high_contrast, enable_color, compression_type):
    """Downloads a YouTube video and its subtitles, then processes frames for ASCII art."""
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            print(f"Created output directory: {output_dir}")

        # Use yt-dlp to download video and subtitles
        print(f"Downloading video and subtitles for: {youtube_url}...")
        temp_dir = os.path.join(output_dir, "temp_download")
        os.makedirs(temp_dir, exist_ok=True)
        
        # yt-dlp command to download video and all available subtitles (en, ko preferred)
        # --skip-download to only get info and subtitles
        # --write-auto-subs to get auto-generated subtitles if no manual ones
        # --sub-langs all to get all available subtitles
        # --sub-format vtt to ensure VTT format
        # --output to specify output template for video and subtitle files
        
        # First, get video info to determine a clean filename
        info_command = [
            "yt-dlp",
            "--get-filename",
            "-o", "%(title)s",
            youtube_url
        ]
        info_result = subprocess.run(info_command, capture_output=True, text=True, check=True)
        video_title_raw = info_result.stdout.strip()
        # Sanitize title for filename
        video_filename_base = re.sub(r'[\\/:*?"<>|]', '', video_title_raw)
        
        download_command = [
            "yt-dlp",
            "--write-subs",
            "--write-auto-subs",
            "--sub-langs", "en", # Prioritize en, ko, then all
            "--sub-format", "vtt",
            "--output", os.path.join(temp_dir, f"{video_filename_base}.%(ext)s"),
            youtube_url
        ]
        
        subprocess.run(download_command, check=True)
        print("Download complete.")

        # Find the downloaded video file and VTT subtitle file
        video_file = None
        vtt_file = None
        for f in os.listdir(temp_dir):
            if f.startswith(video_filename_base) and f.endswith(('.mp4', '.webm', '.mkv', '.avi', '.mov')):
                video_file = os.path.join(temp_dir, f)
            if f.startswith(video_filename_base) and f.endswith('.vtt'):
                vtt_file = os.path.join(temp_dir, f)
        
        if not video_file:
            raise FileNotFoundError("Could not find downloaded video file.")
        if not vtt_file:
            print("Warning: No VTT subtitle file found. Processing will continue without subtitles.")
            subtitles = []
        else:
            print(f"Parsing subtitles from: {vtt_file}")
            subtitles = parse_vtt(vtt_file)
            if not subtitles:
                print("Warning: No subtitle entries found in the VTT file.")

        cap = cv2.VideoCapture(video_file)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_file}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        total_duration_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC)) # This might not be accurate until video is fully read
        
        print(f"Video FPS: {fps}, Total frames: {total_frames}")

        metadata_frames = []
        saved_count = 0

        # If no subtitles, process a few frames evenly spaced
        if not subtitles:
            print("No subtitles found. Processing 10 evenly spaced frames.")
            num_frames_to_process = 10
            if total_frames > 0:
                frame_interval = total_frames // num_frames_to_process
                if frame_interval == 0: frame_interval = 1 # Ensure at least 1 frame interval
                
                for i in range(num_frames_to_process):
                    target_frame_num = i * frame_interval
                    if target_frame_num >= total_frames:
                        break
                    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_num)
                    ret, frame = cap.read()
                    if ret:
                        current_time_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
                        print(f"  - Processing frame {target_frame_num} at {current_time_ms}ms...")
                        ascii_obj = frame_to_ascii_object(frame, width, char_ramp, high_contrast, enable_color, compression_type)
                        
                        output_json_filename = f"frame_{saved_count:04d}.json"
                        output_json_path = os.path.join(output_dir, output_json_filename)
                        
                        with open(output_json_path, 'w', encoding='utf-8') as f:
                            json.dump(ascii_obj, f, indent=2)
                        
                        metadata_frames.append({
                            "path": output_json_filename,
                            "time_ms": current_time_ms,
                            "subtitle": "" # No subtitle for these frames
                        })
                        saved_count += 1
            else:
                print("Could not determine total frames for video.")
        else:
            for i, sub in enumerate(subtitles):
                target_time_ms = sub['start_ms']
                subtitle_text = sub['text']
                
                # Seek to the exact millisecond
                cap.set(cv2.CAP_PROP_POS_MSEC, target_time_ms)
                ret, frame = cap.read()
                
                if ret:
                    current_time_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
                    print(f"  - Processing subtitle {i+1}/{len(subtitles)} at {current_time_ms}ms: '{subtitle_text[:50]}...'")
                    ascii_obj = frame_to_ascii_object(frame, width, char_ramp, high_contrast, enable_color, compression_type)
                    
                    output_json_filename = f"frame_{saved_count:04d}.json"
                    output_json_path = os.path.join(output_dir, output_json_filename)
                    
                    with open(output_json_path, 'w', encoding='utf-8') as f:
                        json.dump(ascii_obj, f, indent=2)
                    
                    metadata_frames.append({
                        "path": output_json_filename,
                        "time_ms": current_time_ms,
                        "subtitle": subtitle_text
                    })
                    saved_count += 1
                else:
                    print(f"  - Warning: Could not read frame for subtitle at {target_time_ms}ms: '{subtitle_text[:50]}...'")
        
        cap.release()
        
        # Calculate total duration from processed frames if available, otherwise from video
        if metadata_frames:
            total_duration_ms = metadata_frames[-1]["time_ms"] # Approximate total duration
        else:
            total_duration_ms = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / fps * 1000) # Fallback

        # Write metadata JSON file
        metadata_file_path = os.path.join(output_dir, "metadata.json")
        
        metadata_content = {
            "frames": metadata_frames,
            "frame_interval_ms": 0, # Not applicable for subtitle-driven frames
            "total_duration_ms": total_duration_ms,
            "source_url": youtube_url
        }
        if compression_type != 'none':
            metadata_content["compression_type"] = compression_type
        
        with open(metadata_file_path, 'w', encoding='utf-8') as f:
            json.dump(metadata_content, f, indent=2)
        print(f"Successfully saved metadata to {metadata_file_path}")
        
        print(f"\nProcessing complete. Saved {saved_count} frames to {output_dir}\n")

    except subprocess.CalledProcessError as e:
        print(f"yt-dlp command failed: {e}", file=sys.stderr)
        print(f"Stdout: {e.stdout}", file=sys.stderr)
        print(f"Stderr: {e.stderr}", file=sys.stderr)
        print("Please ensure yt-dlp is installed and accessible in your PATH.", file=sys.stderr)
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
    finally:
        # Clean up temporary download directory
        if os.path.exists(temp_dir):
            # print(f"Cleaning up temporary directory: {temp_dir}")
            # shutil.rmtree(temp_dir) # Commented out to keep downloaded video
            pass # Added pass to ensure block is not empty

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert a YouTube video to ASCII art JSON data file(s) based on subtitles.')
    parser.add_argument('--youtube-url', required=True, help='The URL of the YouTube video.')
    parser.add_argument('--output', help='Path to the output directory. If not provided, defaults to a directory named after the video title.')
    parser.add_argument('--width', type=int, default=150, help='Initial character width of the ASCII art.')
    parser.add_argument('--charset', choices=list(CHAR_SETS.keys()), default='basic', help='Pre-defined character set.')
    parser.add_argument('--custom-charset', type=str, help='A custom string of characters to use as a ramp.')
    parser.add_argument('--high-contrast', action='store_true', help='Use high-contrast mode.')
    parser.add_argument('--color', action='store_true', help='Enable color processing for ASCII art.')
    parser.add_argument('--compression-type', choices=['none', 'rle'], default='none', help='Type of compression to apply to ASCII content.')
    args = parser.parse_args()

    if args.custom_charset:
        char_ramp = args.custom_charset
    elif args.high_contrast:
        char_ramp = "# "
    else:
        char_ramp = CHAR_SETS[args.charset]

    output_dir = args.output
    if not output_dir:
        # Try to get a sanitized title for the output directory
        try:
            info_command = [
                "yt-dlp",
                "--get-filename",
                "-o", "%(title)s",
                args.youtube_url
            ]
            info_result = subprocess.run(info_command, capture_output=True, text=True, check=True)
            video_title_raw = info_result.stdout.strip()
            output_dir = re.sub(r'[\\/:*?"<>|]', '', video_title_raw)
            print(f"Output directory not specified. Using video title: {output_dir}")
        except Exception as e:
            print(f"Could not determine video title for output directory, using 'youtube_ascii_output': {e}", file=sys.stderr)
            output_dir = "youtube_ascii_output"
    
    process_youtube_video(args.youtube_url, output_dir, args.width, char_ramp, args.high_contrast, args.color, args.compression_type)
