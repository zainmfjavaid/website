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

        var linkButton = document.createElement('div');
        linkButton.style.borderRight = "0.5px solid rgba(55, 53, 47, 0.25)";
        linkButton.className = 'toolbar-button';
        linkButton.innerHTML = '<svg id="svg-arrow"><path d="M13.1475 10.5869V3.72363C13.1475 3.25195 12.833 2.93066 12.3477 2.93066H5.48438C5.02637 2.93066 4.70508 3.27246 4.70508 3.67578C4.70508 4.07227 5.05371 4.40039 5.46387 4.40039H7.89746L10.8438 4.30469L9.59961 5.39844L3.08496 11.9199C2.92773 12.0771 2.8457 12.2686 2.8457 12.46C2.8457 12.8564 3.20801 13.2256 3.61816 13.2256C3.80957 13.2256 3.99414 13.1504 4.15137 12.9932L10.6729 6.47168L11.7803 5.22754L11.6641 8.05762V10.6074C11.6641 11.0176 11.9922 11.373 12.4023 11.373C12.8057 11.373 13.1475 11.0312 13.1475 10.5869Z"></path></svg>'
        linkButton.innerHTML += '<span style="border-bottom: 1px solid rgba(55, 53, 47, 0.25);">Link</span>';

        var boldButton = document.createElement('div');
        boldButton.className = 'toolbar-button';
        boldButton.innerHTML = '<span style="font-weight: 600;">B</span>'

        var italicButton = document.createElement('div')
        italicButton.className = 'toolbar-button';
        italicButton.innerHTML = '<span style="font-weight: 300; font-style: italic;">i</span>'

        var underlineButton = document.createElement('div')
        underlineButton.className = 'toolbar-button';
        underlineButton.innerHTML = '<span style="text-decoration: underline;">U</span>'

        var strikethroughButton = document.createElement('div');
        strikethroughButton.className = 'toolbar-button';
        strikethroughButton.innerHTML = '<span style="text-decoration: line-through;">S</span>'

        toolbar.append(linkButton);
        toolbar.appendChild(boldButton);
        toolbar.appendChild(italicButton);
        toolbar.appendChild(underlineButton);
        toolbar.appendChild(strikethroughButton);

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
                    var currentToolbarTop = lineRect.top + window.scrollY - toolbar.offsetHeight - 35;
                    lastToolbarTop = currentToolbarTop;
                    lastSelectedLineElement = lineElement;
                    toolbar.style.top = `${currentToolbarTop}px`;
                }
    
                toolbar.style.position = 'absolute';
                toolbar.style.left = `${toolbarLeft}px`;
                toolbar.style.display = 'flex';
            } else {
                toolbar.style.display = 'none';
                lastSelectedLineElement = null;
            }
        }, 10);
    }    
});