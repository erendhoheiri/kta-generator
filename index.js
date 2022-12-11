let name = document.getElementById('name');
let submit = document.getElementById('submit');
submit.addEventListener('click', () => {
  //   let credentialUser = Math.ceil(Math.random() * 10000);
  //   let str = 'TSStudetn2020' + credentialUser.toString();
  generetPdf(name.value, pimkot.value);
  name.value = '';
  pimkot.value = '';
});

const generetPdf = async (name, pimkot) => {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  if (name === '' || pimkot === '') {
    alert('Masukkan Nama & Lokasi Pimpinan Kota Anda');
    return;
  }

  const exBytes = await fetch('./Cert.pdf').then(res => {
    return res.arrayBuffer();
  });

  const exFont = await fetch('./Righteous-Regular.ttf').then(res => {
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(exBytes);

  pdfDoc.registerFontkit(fontkit);
  const myFont = await pdfDoc.embedFont(exFont);
  //   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let nameWidth = await myFont.widthOfTextAtSize(name, 18);
  let pimkotWidth = await myFont.widthOfTextAtSize(pimkot, 12);

  const pages = pdfDoc.getPages();
  const firstP = pages[0];
  const { width } = firstP.getSize();
  firstP.drawText(name, {
    x: (width - nameWidth) / 2,
    y: 85,
    size: 18,
    font: myFont,
    color: rgb(0, 0, 0)
  });

  firstP.drawText(pimkot, {
    x: (width - pimkotWidth) / 2,
    y: 70,
    size: 12,
    font: myFont,
    color: rgb(0, 0, 0)
  });

  const uri = await pdfDoc.saveAsBase64({ dataUri: true });
  saveAs(uri, `KTA-Kongres-${name}.pdf`, { autoBom: true });
  // document.querySelector("#myPDF").src = uri;
};
