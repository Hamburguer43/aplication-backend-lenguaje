import puppeteer from 'puppeteer';

export const generatePDF = async (htmlContent) => {

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox'] 
    });
    
    const page = await browser.newPage();
    
    await page.emulateMediaType('screen');
    
    await page.setContent(htmlContent, { 
        waitUntil: ['load', 'networkidle0'] 
    });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        timeout: 0 // Evita que se cierre por lentitud
    });

    await browser.close();
    return pdfBuffer;
};