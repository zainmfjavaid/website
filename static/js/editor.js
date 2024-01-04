document.addEventListener('DOMContentLoaded', function() {
    var editArea = document.querySelector('#edit-area');
    var contentBlocks = document.querySelectorAll('.content-block');
    contentBlocks.forEach(addBlockEventListener);

    function addBlockEventListener(contentBlock) {
        contentBlock.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();

                const nextContentBlock = contentBlock.nextElementSibling;
                if (nextContentBlock !== null && nextContentBlock.classList.contains('content-block')) {
                    nextContentBlock.focus()
                } else {
                    var newBlock = document.createElement('p');
                    newBlock.className = 'content-block paragraph-block';
                    newBlock.contentEditable = true;
                    newBlock.setAttribute('data-placeholder', 'Type / to choose a block');

                    editArea.appendChild(newBlock);
                    addBlockEventListener(newBlock);

                    newBlock.focus();
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                if (!contentBlock.classList.contains('pre-populate') && contentBlock.textContent === '') {
                    const previousContentBlock = contentBlock.previousElementSibling;
                    contentBlock.remove();
                
                    setTimeout(function(){
                        if (previousContentBlock && previousContentBlock.isContentEditable) {
                            let range = document.createRange();
                            let sel = window.getSelection();
                
                            range.selectNodeContents(previousContentBlock);
                            range.collapse(false);
                
                            sel.removeAllRanges();
                            sel.addRange(range);
                
                            previousContentBlock.focus();
                        }
                    }, 0);
                }                
            } else if (e.key === 'ArrowUp') {
                const previousContentBlock = contentBlock.previousElementSibling;
                if (previousContentBlock) {
                    setTimeout(function(){
                        if (previousContentBlock && previousContentBlock.isContentEditable) {
                            let range = document.createRange();
                            let sel = window.getSelection();
                
                            range.selectNodeContents(previousContentBlock);
                            range.collapse(false);
                
                            sel.removeAllRanges();
                            sel.addRange(range);
                
                            previousContentBlock.focus();
                        }
                    }, 0);
                }
            } else if (e.key === 'ArrowDown') {
                const nextContentBlock = contentBlock.nextElementSibling;
                if (nextContentBlock) {
                    setTimeout(function(){
                        if (nextContentBlock && nextContentBlock.isContentEditable) {
                            let range = document.createRange();
                            let sel = window.getSelection();
                
                            range.selectNodeContents(nextContentBlock);
                            range.collapse(false);
                
                            sel.removeAllRanges();
                            sel.addRange(range);
                
                            nextContentBlock.focus();
                        }
                    }, 0);
                }
            }
        });
    }
});