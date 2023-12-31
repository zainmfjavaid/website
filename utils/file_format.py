from typing import List


IMAGE_ENDINGS = ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.webp', '.svg']

def _contains_endings(file_name: str, endings: List) -> bool:
    """Helper function to check if a file ends with an extension from a list of endings

    Args:
        file_name (str): Name of the file
        endings (List): List of endings to check for

    Returns:
        bool: Whether the file contains an extension from the list of endings
    """
    return any([file_name.endswith(ending) for ending in endings])

def is_image_file(file_name: str) -> bool:
    """Check if a file has an image ending based on its name

    Args:
        file_name (str): Name of the file

    Returns:
        bool: Whether it has an image extension
    """
    return _contains_endings(file_name, IMAGE_ENDINGS)