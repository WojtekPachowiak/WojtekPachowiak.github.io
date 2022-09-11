const sidebar_button = document.querySelectorAll('.sidenav a');

function offset(el){
    const amp = 1
    el.style.setProperty('--sidenav-a-top', (Math.random()-0.5)*2*amp +'px')
    el.style.setProperty('--sidenav-a-left', (Math.random()-0.5)*2*amp +'px')
}

sidebar_button.forEach((b) => {
    setInterval(offset,20,b)
})
