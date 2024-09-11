const validateSerialNumber = (serialNumber) => {
    return serialNumber && !isNaN(serialNumber) && Number(serialNumber) > 0;
};

const validateURL = (url) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-zA-Z0-9_-]+\\.)+[a-zA-Z]{2,})|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-zA-Z0-9%_.~+]*)*' + // port and path
        '(\\?[;&a-zA-Z0-9%_.~+=-]*)?' + // query string
        '(\\#[-a-zA-Z0-9_]*)?$', 'i'); // fragment locator
    return !!urlPattern.test(url);
};

const validateProductName = (productName) => {
    return productName && productName.trim().length > 0;
};

module.exports = {
    validateSerialNumber,
    validateURL,
    validateProductName
}