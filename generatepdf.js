// generate a PDF
    const printPDFButton = document.getElementById('print-pdf');

    printPDFButton.addEventListener('click', function(event){
        ipcRenderer.send('print-to-pdf');
    });


    ipcRenderer.on('wrote-pdf', function(event, path){
        const message = `Wrote PDF to: ${path}`;
        document.getElementById('pdf-path').innerHTML = message;
    });
