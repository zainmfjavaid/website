import os
from typing import List
from pathlib import Path


IMAGE_ENDINGS = ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.webp', '.svg']

def _contains_endings(file_name: str, endings: List) -> bool:
    """Helper function to check if a file ends with an extension from a list of endings

    Args:
        file_name (str): Name of the file
        endings (List): List of endings to check for

    Returns:
        bool: Whether the file contains an extension from the list of endings
    """
    return any([file_name.lower().endswith(ending) for ending in endings])

def is_image_file(file_name: str) -> bool:
    """Check if a file has an image ending based on its name

    Args:
        file_name (str): Name of the file

    Returns:
        bool: Whether it has an image extension
    """
    return _contains_endings(file_name, IMAGE_ENDINGS)

def get_file_paths_by_time(directory: str) -> List:
    """Gets paths in a directory then sorts them by time modified

    Args:
        directory (str): Directory to list from

    Returns:
        List: Sorted list of paths
    """
    return [str(os.path.basename(file_path)) for file_path in sorted(Path(directory).iterdir(), key=os.path.getmtime, reverse=True)]