var linkButton;
var boldButton;
var italicButton;
var underlineButton;
var strikethroughButton;

document.addEventListener('DOMContentLoaded', function() {
    // Keyboard shortcut management
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
            } else if (e.key == '/') {
                if (contentBlock.textContent.trim() === '') {
                    showActionModal(contentBlock);
                }
            }
        });
    }

    function showActionModal(contentBlock) {
        var modal = document.createElement('div');
        modal.className = 'action-modal';
        document.body.appendChild(modal);
    
        var rect = contentBlock.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${rect.top - modal.offsetHeight}px`;
        modal.style.left = `${rect.left}px`;
    
        modal.style.display = 'block';

        let ignoreFirstKeydown = true;

        function closeModal() {
            document.removeEventListener('keydown', onKeydown);
            document.removeEventListener('click', onClickOutsideModal);
            modal.remove();
        }
    
        function onKeydown(e) {
            if (ignoreFirstKeydown) {
                ignoreFirstKeydown = false;
            } else if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
                closeModal();
            }
        }
    
        function onClickOutsideModal(e) {
            if (!modal.contains(e.target)) {
                closeModal();
            }
        }
    
        document.addEventListener('keydown', onKeydown);
        document.addEventListener('click', onClickOutsideModal);
    }

    function handleEnterKey(e, contentBlock) {
        e.preventDefault();
        var newBlock = document.createElement('p');
        newBlock.className = 'content-block paragraph-block';
        newBlock.contentEditable = true;
        newBlock.setAttribute('data-placeholder', 'Type / to choose a block');
        editArea.appendChild(newBlock);
        addBlockEventListener(newBlock);
        newBlock.focus();
    }

    function handleDeleteKey(contentBlock) {
        if (!contentBlock.classList.contains('pre-populate') && contentBlock.textContent.trim() === '') {
            var previousBlock = contentBlock.previousElementSibling;
            contentBlock.remove();
            if (previousBlock && previousBlock.classList.contains('content-block')) {
                moveFocus(previousBlock);
            }
        }
    }
    
    function moveFocus(targetBlock) {
        if (targetBlock && targetBlock.isContentEditable) {
            setTimeout(function() {
                targetBlock.focus();
                let range = document.createRange();
                range.selectNodeContents(targetBlock);
                range.collapse(false);
                let sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }, 0);
        }
    }

    // Toolbar mangement
    function checkIfSelectionHasStyle(selection, styleProperty, value) {
        if (!selection.rangeCount) return false;
    
        var range = selection.getRangeAt(0);
        var container = range.commonAncestorContainer;
    
        if (container.nodeType === 3) {
            container = container.parentNode;
        }
    
        if (styleProperty === 'link') {
            while (container && container != document.body) {
                if (container.tagName === 'A') {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
    
        var styleValue = window.getComputedStyle(container)[styleProperty];
        if (styleProperty === 'fontWeight') {
            return styleValue === 'bold' || parseInt(styleValue) >= 600;
        } else if (styleProperty === 'textDecoration') {
            return styleValue.includes(value);
        }
        return styleValue === value;
    }    

    function applyTextStyle(command, styleProperty, value, button) {
        var selection = window.getSelection();
    
        if (currentRange) {
            selection.removeAllRanges();
            selection.addRange(currentRange);
    
            document.execCommand(command, false, null);
    
            if (selection.rangeCount > 0) {
                currentRange = selection.getRangeAt(0);
            }
    
            var hasStyle = checkIfSelectionHasStyle(selection, styleProperty, value);
            button.style.color = hasStyle ? 'rgb(35, 131, 226)' : 'inherit';
        }
    }

    function createToolbar() {
        var toolbar = document.createElement('div');
        toolbar.id = 'text-toolbar';
        toolbar.style.display = 'none';

        linkButton = document.createElement('div');
        linkButton.style.borderRight = "0.5px solid rgba(55, 53, 47, 0.25)";
        linkButton.className = 'toolbar-button';
        linkButton.innerHTML = '<svg id="svg-arrow"><path d="M13.1475 10.5869V3.72363C13.1475 3.25195 12.833 2.93066 12.3477 2.93066H5.48438C5.02637 2.93066 4.70508 3.27246 4.70508 3.67578C4.70508 4.07227 5.05371 4.40039 5.46387 4.40039H7.89746L10.8438 4.30469L9.59961 5.39844L3.08496 11.9199C2.92773 12.0771 2.8457 12.2686 2.8457 12.46C2.8457 12.8564 3.20801 13.2256 3.61816 13.2256C3.80957 13.2256 3.99414 13.1504 4.15137 12.9932L10.6729 6.47168L11.7803 5.22754L11.6641 8.05762V10.6074C11.6641 11.0176 11.9922 11.373 12.4023 11.373C12.8057 11.373 13.1475 11.0312 13.1475 10.5869Z"></path></svg>'
        linkButton.innerHTML += '<span style="border-bottom: 1px solid rgba(55, 53, 47, 0.25);">Link</span>';
        linkButton.onclick = function() {
            var selection = window.getSelection();
            if (currentRange) {
                selection.removeAllRanges();
                selection.addRange(currentRange);
        
                var anchorNode = selection.anchorNode;
                while (anchorNode && anchorNode.nodeName !== 'A' && anchorNode.nodeName !== 'BODY') {
                    anchorNode = anchorNode.parentNode;
                }
                var isLink = anchorNode.nodeName === 'A';
        
                if (isLink) {
                    var text = anchorNode.textContent;
                    var textNode = document.createTextNode(text);
                    anchorNode.parentNode.replaceChild(textNode, anchorNode);
        
                    currentRange.setStartBefore(textNode);
                    currentRange.setEndAfter(textNode);
        
                    linkButton.style.color = 'inherit';
                } else {
                    var url = prompt("Enter the URL:", "https://");
                    if (url) {
                        var anchor = document.createElement('a');
                        anchor.href = url;
                        anchor.textContent = currentRange.toString();
                        anchor.className = 'embedded-text-link';
                        anchor.onclick = function() {
                            window.open(anchor.href, '_blank');
                        }

                        anchor.onmouseover = function() {
                            anchor.style.color = 'red';
                        }

                        anchor.onmouseleave = function() {
                            anchor.style = 'inherit';
                        }
        
                        currentRange.deleteContents();
                        currentRange.insertNode(anchor);
        
                        currentRange.selectNode(anchor);
        
                        linkButton.style.color = 'rgb(35, 131, 226)';
                    }
                }
                
                selection.removeAllRanges();
                selection.addRange(currentRange);
            }
        };                   

        boldButton = document.createElement('div');
        boldButton.className = 'toolbar-button';
        boldButton.innerHTML = '<span style="font-weight: 600;">B</span>'
        boldButton.onclick = function() {
            applyTextStyle('bold', 'fontWeight', 'bold', boldButton);
        };

        italicButton = document.createElement('div')
        italicButton.className = 'toolbar-button';
        italicButton.innerHTML = '<span style="font-style: italic;">i</span>'
        italicButton.onclick = function() {
            applyTextStyle('italic', 'fontStyle', 'italic', italicButton);
        };

        underlineButton = document.createElement('div')
        underlineButton.className = 'toolbar-button';
        underlineButton.innerHTML = '<span style="text-decoration: underline;">U</span>'
        underlineButton.onclick = function() {
            applyTextStyle('underline', 'textDecoration', 'underline', underlineButton);
        };

        strikethroughButton = document.createElement('div');
        strikethroughButton.className = 'toolbar-button';
        strikethroughButton.innerHTML = '<span style="text-decoration: line-through;">S</span>'
        strikethroughButton.onclick = function() {
            applyTextStyle('strikethrough', 'textDecoration', 'line-through', strikethroughButton);
        };

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
    var currentRange = null;

    function showToolbar() {
        setTimeout(function() {
            var sel = window.getSelection();
            if (!sel.isCollapsed && sel.rangeCount > 0) {
                currentRange = sel.getRangeAt(0);

                var isLink = checkIfSelectionHasStyle(window.getSelection(), 'link');
                linkButton.style.color = isLink ? 'rgb(35, 131, 226)' : 'inherit';

                var isBold = checkIfSelectionHasStyle(sel, 'fontWeight', 'bold');
                boldButton.style.color = isBold ? 'rgb(35, 131, 226)' : 'inherit';

                var isItalic = checkIfSelectionHasStyle(sel, 'fontStyle', 'italic');
                italicButton.style.color = isItalic ? 'rgb(35, 131, 226)' : 'inherit';

                var isUnderline = checkIfSelectionHasStyle(sel, 'textDecoration', 'underline') && !isLink;
                underlineButton.style.color = isUnderline ? 'rgb(35, 131, 226)' : 'inherit';

                var isStrikethrough = checkIfSelectionHasStyle(sel, 'textDecoration', 'line-through');
                strikethroughButton.style.color = isStrikethrough ? 'rgb(35, 131, 226)' : 'inherit';

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