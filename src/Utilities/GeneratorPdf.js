import puppeteer from 'puppeteer';

export const generatePDF = async (htmlContent) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ] 
    });
    
    try {
        const page = await browser.newPage();
        
        // Bloqueamos la descarga de recursos que no necesitas para este PDF
        // Esto acelera muchísimo el renderizado
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
                req.continue();
            } else {
                req.abort();
            }
        });

        await page.setContent(htmlContent, { 
            waitUntil: 'load', // Cambiado de networkidle0 a load
            timeout: 60000     // Aumentamos a 60 segundos por precaución
        });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Error detallado en Puppeteer:", error);
        throw error;
    } finally {
        await browser.close();
    }
};