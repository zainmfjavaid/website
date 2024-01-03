document.addEventListener('DOMContentLoaded', function() {
    var editArea = document.querySelector('#edit-area');
    var contentBlocks = document.querySelectorAll('.content-block');
    contentBlocks.forEach(function(contentBlock) {
        contentBlock.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                console.log('enter');
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                console.log('delete');
            }
        });
    });
});