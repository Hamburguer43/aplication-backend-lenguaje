import puppeteer from 'puppeteer';

export const generatePDF = async (htmlContent) => {
    
    console.log("Iniciando Puppeteer con cache en:", process.env.PUPPETEER_CACHE_DIR);

    const browser = await puppeteer.launch({ 
        headless: "new",
        
        // Agregamos argumentos extra necesarios para entornos sin interfaz gráfica
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Evita errores de memoria compartida en contenedores
            '--single-process'
        ] 
    });
    
    try {
        const page = await browser.newPage();
        
        await page.emulateMediaType('screen');
        
        // waitUntil: 'networkidle0' es vital para que carguen imágenes/estilos
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle0' 
        });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            timeout: 0 
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Error generando el PDF:", error);
        throw error;
    } finally {
        // Siempre cerramos el navegador, incluso si hay error, para no dejar procesos colgados
        await browser.close();
    }
};