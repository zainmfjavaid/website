// Gallery rendering event listener
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noAnimation = urlParams.get('noAnimation');
    if (noAnimation !== 'true') {
        document.getElementById('media-container').classList.add('fade-in');
    } else {
        const newUrl = window.location.pathname;
        window.history.pushState('object', document.title, newUrl);
    }

    bindGalleryImages();
});

// File upload button event listener
document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('upload-button');
    const fileInput = document.getElementById('file-input');

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            uploadFiles(Array.from(fileInput.files));
        }
    });
});

// Image action handling
function bindGalleryImages() {
    const expandedContainer = document.createElement('div');
    expandedContainer.className = 'expanded-image-container';
    document.body.appendChild(expandedContainer);

    document.querySelectorAll('.gallery-image').forEach(img => {
        img.id = 'image-' + decodeURIComponent(img.src.split('/').pop());

        img.addEventListener('click', () => {
            expandedContainer.innerHTML = '';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'image-wrapper';
            expandedContainer.appendChild(imageWrapper);

            const expandedImg = img.cloneNode(true);
            expandedImg.className = 'expanded-image';
            imageWrapper.appendChild(expandedImg);

            const fileName = document.createElement('span');
            fileName.textContent = decodeURIComponent(img.src.split('/').pop());
            fileName.className = 'file-name';
            fileName.title = 'Double-click to rename';
            expandedContainer.appendChild(fileName);

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'file-name-input';
            input.style.position = 'absolute';
            input.style.top = '30px';
            input.style.left = '140px';
            input.style.display = 'none';
            expandedContainer.appendChild(input);

            const dropdownBtn = document.createElement('button');
            dropdownBtn.textContent = 'File';
            dropdownBtn.className = 'dropdown-button';
            expandedContainer.appendChild(dropdownBtn);

            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            expandedContainer.appendChild(dropdownContent);

            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '<i class="fa-solid fa-edit"></i> Rename';
            renameBtn.className = 'dropdown-item';
            dropdownContent.appendChild(renameBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
            deleteBtn.className = 'dropdown-item';
            dropdownContent.appendChild(deleteBtn);

            const dropdownDownloadButton = document.createElement('button');
            dropdownDownloadButton.innerHTML = '<i class="fa-solid fa-download"></i> Download';
            dropdownDownloadButton.className = 'dropdown-item';
            dropdownContent.appendChild(dropdownDownloadButton);

            dropdownBtn.onclick = function() {
                dropdownContent.classList.toggle('show');
                this.classList.toggle('active');
            };

            renameBtn.onclick = function() {
                closeDropdownMenu();
                input.value = fileName.textContent;
                input.style.display = 'inline';
                fileName.style.display = 'none';
                dropdownBtn.style.top = '60px';
                input.focus();
            }

            deleteBtn.onclick = async function() {
                closeDropdownMenu();

                const fileNameToDelete = fileName.textContent;
                const data = { fileName: fileNameToDelete };

                try {
                    const response = await fetch('/portal/media/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        console.log('File deleted successfully');
                        removeImageFromGallery(fileNameToDelete);
                    } else {
                        console.error('Error deleting file');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
                closeExpandedImage();
            };

            function removeImageFromGallery(fileName) {
                const imageElement = document.getElementById('image-' + fileName);
                if (imageElement) {
                    imageElement.parentNode.removeChild(imageElement);
                }
            }

            dropdownDownloadButton.onclick = function() {
                closeDropdownMenu();            
                const tempDownloadLink = document.createElement('a');
                tempDownloadLink.href = img.src;
                tempDownloadLink.download = fileName.textContent;
                tempDownloadLink.style.display = 'none';
                document.body.appendChild(tempDownloadLink);
                tempDownloadLink.click();
                document.body.removeChild(tempDownloadLink);
            };

            fileName.ondblclick = function() {
                input.value = fileName.textContent;
                input.style.display = 'inline';
                fileName.style.display = 'none';
                dropdownBtn.style.top = '60px';
                input.focus();
            };

            input.onblur = function() {
                fileName.textContent = this.value;
                fileName.style.display = 'inline';
                input.style.display = 'none';
                dropdownBtn.style.top = '48px';
            };

            input.onkeyup = async function(e) {
                if (e.key === 'Enter') {
                    if (!this.value.includes('.')) {
                        this.value = this.value + '.png';
                    }

                    const data = {
                        oldName: fileName.textContent,
                        newName: this.value
                    };

                    try {
                        const response = await fetch('/portal/media/rename', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });

                        if (response.ok) {
                            console.log('File renamed successfully');
                            const responseData = await response.json();
                            const newUrl = responseData.newUrl;
                            downloadBtn.href = newUrl;
                            downloadBtn.download = this.value;
                            img.id = 'image-' + this.value;
                            img.src = newUrl;

                        } else {
                            console.error('Error renaming file');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }

                    this.blur();
                }
            };

            const downloadBtn = document.createElement('a');
            downloadBtn.textContent = 'Download';
            downloadBtn.className = 'download-button opacity-hover';
            downloadBtn.href = img.src;
            downloadBtn.download = fileName.textContent;
            expandedContainer.appendChild(downloadBtn);

            const closeBtn = document.createElement('a');
            closeBtn.textContent = 'X';
            closeBtn.className = 'close-button opacity-hover';
            closeBtn.onclick = closeExpandedImage;
            expandedContainer.appendChild(closeBtn);

            expandedContainer.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });
    });

    function closeDropdownMenu() {
        const dropdownBtn = document.querySelector('.dropdown-button');
        const dropdownContent = document.querySelector('.dropdown-content');

        if (dropdownBtn && dropdownContent) {
            dropdownContent.classList.remove('show');
            if (dropdownBtn.classList.contains('active')) {
                dropdownBtn.classList.remove('active');
                dropdownBtn.blur();
            }
        }
    }

    function closeExpandedImage() {
        expandedContainer.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }

    document.addEventListener('mousedown', function(event) {
        const dropdownBtn = document.querySelector('.dropdown-button');
        const dropdownContent = document.querySelector('.dropdown-content');
    
        if (dropdownBtn && dropdownContent) {
            if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                    if (dropdownBtn.classList.contains('active')) {
                        dropdownBtn.classList.remove('active');
                        dropdownBtn.blur();
                    }
                }
            }
        }
    });    

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.className === 'file-name-input') {
                activeElement.blur();
            } else if (activeElement && activeElement.className == 'dropdown-button active') {
                document.querySelector('.dropdown-content').classList.toggle('show');
                activeElement.classList.toggle('active');
                activeElement.blur();
            } else {
                closeExpandedImage();
            }
        }
    });
}

// Drag and drop + file upload handler
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    setupDragAndDrop(dropZone);
});

function setupDragAndDrop(dropZone) {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showDropZone(dropZone);
    });

    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.relatedTarget === null) {
            hideDropZone(dropZone);
        }
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideDropZone(dropZone);
        const files = Array.from(e.dataTransfer.files);
        uploadFiles(files);
    });
}

function showDropZone(dropZone) {
    dropZone.style.display = 'block';
}

function hideDropZone(dropZone) {
    dropZone.style.display = 'none';
}

function uploadFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            formData.append('files[]', file);
        }
    });

    fetch('/portal/media/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.uploadedImages) {
            updateGallery(data.uploadedImages);
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateGallery(uploadedImages) {
    const mediaContainer = document.getElementById('media-container');
    uploadedImages.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'gallery-image';
        mediaContainer.appendChild(img);
    });

    window.location.href = window.location.pathname + '?noAnimation=true';
}