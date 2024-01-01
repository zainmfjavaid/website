# General modules
import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Modules to test
from utils.file_format import is_image_file


@pytest.fixture
def ending_test_cases():
    files = ['photo.jpg', 'image.PNG', 'document.pdf', 'picture.bmp', '', 'png.tar', 'archive.tar.gz']
    expected_outputs = [True, True, False, False, False, False, False]
    return dict(zip(files, expected_outputs))

def test_is_image(ending_test_cases):
    for file in ending_test_cases:
        assert ending_test_cases[file] == is_image_file(file)