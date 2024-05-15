const { default: axios, AxiosRequestConfig, AxiosResponse } = require("axios");
const FormData = require("form-data");
const qs = require("querystring");

/**
 *
 * @param { string } url
 * @param { FormData | {} } formdata
 * @param { AxiosRequestConfig } options
 * @returns { Promise<AxiosResponse> }
 */
const post = async (url, formdata, options) => {
  return new Promise((resolve, reject) => {
    if (!(formdata instanceof FormData)) {
      return axios
        .post(url, qs.stringify(formdata), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          ...options,
        })
        .then(resolve)
        .catch(reject);
    } else {
      return axios
        .post(url, formdata, { headers: formdata.getHeaders(), ...options })
        .then(resolve)
        .catch(reject);
    }
  });
};

const https = require("https");
const fs = require("fs");
const { jsPDF } = require("jspdf");
const cryptoRandom = require("crypto-random-string");

/**
 *
 * @param { string[] } urls
 */
async function captureScreenshots(urls) {
  const pdf = new jsPDF();

  for (const url of urls) {
    await new Promise((resolve) => {
      https.get(
        "https://api.apiflash.com/v1/urltoimage?" +
          new URLSearchParams({
            access_key: "7e9763b4429b4816bd3b9df9ec580bed",
            url: `https://wali.akprind.ac.id/konseling/cetaktranskrip/02/${url}/2021/0/2`,
            delay: "5",
            no_tracking: true,
          }).toString(),
        (response) => {
          response.pipe(
            fs.createWriteStream(`./assets/image/img-${cryptoRandom(4)}.jpg`)
          );
          let imageData = "";

          // Concatenate image data chunks
          response.on("data", (chunk) => {
            imageData += chunk;
          });

          response.on("end", () => {
            // Convert base64 image data to data URI
            const dataURI = `data:image/jpeg;base64,${imageData.toString(
              "base64"
            )}`;

            // Add a new page for each screenshot (optional)
            if (pdf.getNumberOfPages() > 0) {
              pdf.addPage();
            }

            // Add the image to the PDF
            pdf.text(`Screenshot for ${url}`, 10, 10);
            pdf.addImage(dataURI, "JPEG", 10, 20, 180, 120); // Adjust coordinates and dimensions as needed

            resolve();
          });
        }
      );
    });
  }

  // Save the PDF to a file
  pdf.save("./assets/temp/screenshots.pdf");
  return fs.readFileSync("./assets/temp/screenshots.pdf");
}

module.exports = {
  post,
  captureScreenshots,
};
