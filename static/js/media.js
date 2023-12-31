document.addEventListener('DOMContentLoaded', () => {
    const expandedContainer = document.createElement('div');
    expandedContainer.className = 'expanded-image-container';
    document.body.appendChild(expandedContainer);

    document.querySelectorAll('.gallery-image').forEach(img => {
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
            fileName.title = 'Double-click to rename'
            expandedContainer.appendChild(fileName);

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'file-name-input';
            input.style.position = 'absolute';
            input.style.top = '30px';
            input.style.left = '140px';
            input.style.display = 'none';
            expandedContainer.appendChild(input);

            fileName.ondblclick = function() {
                input.value = fileName.textContent;
                input.style.display = 'inline';
                fileName.style.display = 'none';
                input.focus();
            };

            input.onblur = function() {
                fileName.textContent = this.value;
                downloadBtn.download = this.value;
                fileName.style.display = 'inline';
                input.style.display = 'none';
            };

            input.onkeyup = async function(e) {
                if (e.key === 'Enter') {
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.className === 'file-name-input') {
                activeElement.blur();
            } else {
                closeExpandedImage();
            }
        }
    });

    function closeExpandedImage() {
        expandedContainer.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
});