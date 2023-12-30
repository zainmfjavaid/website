document.addEventListener('DOMContentLoaded', () => {
    const expandedContainer = document.createElement('div');
    expandedContainer.className = 'expanded-image-container';
    document.body.appendChild(expandedContainer);

    document.querySelectorAll('.gallery-image').forEach(img => {
        img.addEventListener('click', () => {
            expandedContainer.innerHTML = '';

            const expandedImg = img.cloneNode(true);
            expandedImg.className = 'expanded-image';
            expandedContainer.appendChild(expandedImg);

            const downloadBtn = document.createElement('a');
            downloadBtn.textContent = 'Download';
            downloadBtn.className = 'download-button';
            downloadBtn.href = img.src;
            downloadBtn.download = img.src.split('/').pop();
            expandedContainer.appendChild(downloadBtn);

            expandedContainer.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });
    });

    function closeExpandedImage() {
        expandedContainer.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeExpandedImage();
        }
    });

    expandedContainer.addEventListener('click', (e) => {
        if (e.target.className !== 'download-button') {
            closeExpandedImage();
        }
    });
});