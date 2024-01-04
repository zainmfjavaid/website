document.addEventListener('DOMContentLoaded', function() {
    var editArea = document.querySelector('#edit-area');
    var contentBlocks = document.querySelectorAll('.content-block');
    var toolbar = createToolbar();

    contentBlocks.forEach(addBlockEventListener);
    editArea.addEventListener('mouseup', function(event) {
        showToolbar(event.clientY);
    });
    editArea.addEventListener('keyup', showToolbar);

    function addBlockEventListener(contentBlock) {
        contentBlock.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleEnterKey(e, contentBlock);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleDeleteKey(contentBlock);
            } else if (e.key === 'ArrowUp') {
                moveFocus(contentBlock.previousElementSibling);
            } else if (e.key === 'ArrowDown') {
                moveFocus(contentBlock.nextElementSibling);
            }
        });
    }

    function handleEnterKey(e, contentBlock) {
        e.preventDefault();
        const nextContentBlock = contentBlock.nextElementSibling;
        if (nextContentBlock !== null && nextContentBlock.classList.contains('content-block')) {
            nextContentBlock.focus();
        } else {
            var newBlock = document.createElement('p');
            newBlock.className = 'content-block paragraph-block';
            newBlock.contentEditable = true;
            newBlock.setAttribute('data-placeholder', 'Type / to choose a block');
            editArea.appendChild(newBlock);
            addBlockEventListener(newBlock);
            newBlock.focus();
        }
    }

    function handleDeleteKey(contentBlock) {
        if (!contentBlock.classList.contains('pre-populate') && contentBlock.textContent === '') {
            contentBlock.remove();
            moveFocus(contentBlock.previousElementSibling);
        }
    }

    function moveFocus(targetBlock) {
        if (targetBlock && targetBlock.isContentEditable) {
            setTimeout(function() {
                let range = document.createRange();
                let sel = window.getSelection();
                range.selectNodeContents(targetBlock);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
                targetBlock.focus();
            }, 0);
        }
    }

    function createToolbar() {
        var toolbar = document.createElement('div');
        toolbar.id = 'text-toolbar';
        toolbar.style.display = 'none';
        document.body.appendChild(toolbar);
        return toolbar;
    }

    var lastSelectedLineElement = null;
    var lastToolbarTop = null;

    function showToolbar() {
        setTimeout(function() {
            var sel = window.getSelection();
            if (!sel.isCollapsed && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                var startContainer = range.startContainer;
                var lineElement = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentNode : startContainer;
    
                var rangeRect = range.getBoundingClientRect();
                var toolbarLeft = rangeRect.left + window.scrollX;
    
                if (lineElement === lastSelectedLineElement && lastToolbarTop !== null) {
                    toolbar.style.top = `${lastToolbarTop}px`;
                } else {
                    var lineRect = lineElement.getBoundingClientRect();
                    var currentToolbarTop = lineRect.top + window.scrollY - toolbar.offsetHeight - 15;
                    lastToolbarTop = currentToolbarTop;
                    lastSelectedLineElement = lineElement;
                    toolbar.style.top = `${currentToolbarTop}px`;
                }
    
                toolbar.style.position = 'absolute';
                toolbar.style.left = `${toolbarLeft}px`;
                toolbar.style.display = 'block';
            } else {
                toolbar.style.display = 'none';
                lastSelectedLineElement = null;
            }
        }, 10);
    }    
});