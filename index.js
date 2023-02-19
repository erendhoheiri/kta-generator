let name = document.getElementById('name');
let pimkot = document.getElementById('pimkot');
let arrival = document.getElementById('arrival');
let phone = document.getElementById('phone');
let keberangkatan = document.getElementById('keberangkatan');
let kepulangan = document.getElementById('kepulangan');
let position = document.getElementById('position');
let recomendation = document.getElementById('recomendation');
let alertSuccess = document.getElementById('alert-success');
let alertError = document.getElementById('alert-error');
let submit = document.getElementById('submit');
let loading = document.getElementById('preloading');
let foto = document.getElementById('foto');
let textLoading = document.getElementById('text-loading');

submit.addEventListener('click', async event => {
  event.preventDefault();
  textLoading.textContent = '';
  const store = new SteinStore(
    'https://api.steinhq.com/v1/storages/63970c13eced9b09e9a93974'
  );
  loading.classList.remove('d-none');
  textLoading.textContent = 'Mengirim data ke Server...';
  document.body.style.overflow = 'hidden';

  if (
    name.value === '' ||
    pimkot.value === '' ||
    arrival.value === '' ||
    phone.value === '' ||
    keberangkatan.value === '' ||
    kepulangan.value === '' ||
    position.value === ''
  ) {
    setTimeout(() => {
      loading.classList.add('d-none');
      alertError.classList.remove('d-none');
      document.body.style.overflow = 'visible';
    }, 1500);
    setTimeout(() => {
      alertError.classList.add('d-none');
    }, 10000);
  } else {
    await store
      .append('Sheet1', [
        {
          nama: name.value,
          nomer_hp: phone.value,
          asal_pimkot: pimkot.value,
          regional_keberangkatan: arrival.value,
          tanggal_berangkat: keberangkatan.value,
          tanggal_pulang: kepulangan.value,
          posisi_saat_ini: position.value,
          deskripsi_rekomendasi: recomendation.value
        }
      ])
      .then(res => {
        if (res) {
          alertSuccess.classList.remove('d-none');
          setTimeout(() => {
            alertSuccess.classList.add('d-none');
          }, 10000);
          textLoading.textContent = '...';
        } else {
          alertError.classList.remove('d-none');
          setTimeout(() => {
            alertError.classList.add('d-none');
          }, 10000);
        }
      })
      .catch(error => {
        alert(
          'There has been a problem with your fetch operation: ' + error.message
        );
      });

    textLoading.textContent = 'Generate Kartu Anggota';

    await generetPdf(name.value, pimkot.value);
    name.value = '';
    pimkot.value = '';
    arrival.value = '';
    phone.value = '';
    keberangkatan.value = '';
    kepulangan.value = '';
    position.value = '';
    recomendation.value = '';
    foto.value = null;
    document.body.style.overflow = 'visible';
    loading.classList.add('d-none');
  }
});

var data = [];
var fileName = '';

encodeImageFileAsURL = element => {
  let file = element.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);

  let obj = {
    list: reader,
    fileName: file.name,
    time: new Date().toString()
  };

  reader.onloadend = () => {
    data = [...data, obj];
  };
};

const generetPdf = async (name, pimkot) => {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const exBytes = await fetch('./assets/CERT.pdf').then(res => {
    return res.arrayBuffer();
  });

  const exFont = await fetch('./Righteous-Regular.ttf').then(res => {
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(exBytes);

  pdfDoc.registerFontkit(fontkit);
  const myFont = await pdfDoc.embedFont(exFont);
  //   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let nameWidth = await myFont.widthOfTextAtSize(name, 20);
  let pimkotWidth = await myFont.widthOfTextAtSize(pimkot, 16);

  const pages = pdfDoc.getPages();
  const firstP = pages[0];
  const { width, height } = firstP.getSize();
  firstP.drawText(name, {
    x: (width - nameWidth) / 2,
    y: 94,
    size: 20,
    font: myFont,
    color: rgb(1, 1, 1)
  });

  firstP.drawText(pimkot, {
    x: (width - pimkotWidth) / 2,
    y: 67,
    size: 16,
    font: myFont,
    color: rgb(1, 1, 1)
  });

  async function image() {
    if (data.length === 0) return;
    const jpgUrl = data[0].list.result;

    const jpgImageBytes = await fetch(jpgUrl).then(res => res.arrayBuffer());
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);

    firstP.drawImage(jpgImage, {
      x: 66,
      y: 134,
      width: 137,
      height: 164
    });
  }
  await image();

  data = [];

  const uri = await pdfDoc.saveAsBase64({ dataUri: true });
  saveAs(uri, `KTA-Kongres-${name}.pdf`, { autoBom: true });
};
