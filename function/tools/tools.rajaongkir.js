const fs = require("fs");
const axios = require("axios").default;

const { readFileSync } = require("fs");

class RajaOngkir {
  /**
   *
   * @param { string | null } query
   */
  static async getProvince(query = null) {
    return await axios.get("https://api.rajaongkir.com/starter/province", {
      headers: {
        key: process.env.RAJA_ONGKIR_APIKEY,
      },
      qs: {
        id: query ? query : null,
      },
    });
  }

  /**
   *
   * @param { string } id
   * @param { string } province
   * @returns
   */
  static async getCity(id, province) {
    return await axios.get("https://api.rajaongkir.com/starter/city", {
      headers: {
        key: process.env.RAJA_ONGKIR_APIKEY,
      },
      qs: {
        id: id ? id : null,
        province: province ? province : null,
      },
    });
  }

  /**
   *
   * @param { "jne" | "pos" | "tiki" } courier
   * @param { { origin: string, destination: string, weight: number } } data
   * @returns { Promise<import("./types").RajaOngkirResponse> }
   */
  static async checkCost(courier = "jne", data) {
    const { origin, destination, weight } = data;
    const result = await axios({
      method: "post",
      url: "https://api.rajaongkir.com/starter/cost",
      headers: {
        key: process.env.RAJA_ONGKIR_APIKEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        courier,
        origin,
        destination,
        weight: parseInt(weight),
      }),
    });
    return {
      status: result.statusText,
      data: result.statusText === "OK" ? result.data.rajaongkir : null,
    };
  }

  /**
   * Perform checking Delivery Cost with static origin: `Cilacap` with id `105`
   * - destination - `string` query of city/district names, the match query is using `RegExp()` method
   * - weight - package weight in grams, type: `number` decimal
   * @param { "jne" | "pos" | "tiki" } courier default is JNE
   * @param { { destination: string, weight: number } } param0
   * @returns { Promise<{ status: boolean, message: string, courier: string, data: import("./types").RajaOngkirResponse }> }
   */
  static async checkStaticCost(courier = "jne", { destination, weight }) {
    const { status, data } = this.searchCity(destination);
    if (!status) {
      return {
        status: false,
        message: "Kota tidak ditemukan",
        data: null,
      };
    } else {
      const [city] = data;
      const result = await this.checkCost(courier, {
        origin: "105",
        destination: city.city_id,
        weight,
      });
      const resultStatus = result.status === "OK" ? true : false;
      return {
        status: resultStatus,
        message: "success",
        courier: courier.toUpperCase(),
        data: resultStatus ? result : null,
      };
    }
  }

  /**
   *
   * @param { string } query
   */
  static searchCity(query) {
    /**
     * @type { import("./types").City[] }
     */
    const cityData = JSON.parse(
      readFileSync("./assets/json/static/list-city.json", "utf-8")
    );
    const regex = new RegExp(query, "i");
    const results = cityData.filter((city) => regex.test(city.city_name));
    if (results.length === 0) {
      return {
        status: false,
        data: null,
      };
    }
    return {
      status: true,
      data: results,
    };
  }

  /**
   *
   * @param { string } origin
   * @param { string } destination
   * @returns
   */
  static searchOriginAndDestination(origin, destination) {
    /**
     * @type { import("./types").City[] }
     */
    const cityData = JSON.parse(
      readFileSync("./assets/json/static/list-city.json", "utf-8")
    );
    const [dataOrigin] = cityData.filter((city) =>
      new RegExp(origin, "i").test(city.city_name)
    );
    const [dataDestination] = cityData.filter((city) =>
      new RegExp(destination, "i").test(city.city_name)
    );
    if (!dataOrigin || !dataDestination) {
      return {
        status: false,
        message: `Masukan Nama Kota/Kabupaten ${dataOrigin ? `` : `*Asal*`} ${
          !dataOrigin && !dataDestination ? `&` : ``
        } ${dataDestination ? `` : `*Tujuan*`} tidak ditemukan.`,
      };
    }
    return {
      status: true,
      data: {
        origin: dataOrigin,
        destination: dataDestination,
      },
    };
  }

  /**
   * Weight Converter, grams to kilograms
   *
   * if parse = `true` it will return locale string, otherwise number
   * @param { { value: number, parse: boolean } } dto
   */
  static weightConverter({ value, parse = true }) {
    const kilograms = value / 1000;
    return parse
      ? kilograms.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : kilograms;
  }
}

module.exports = RajaOngkir;
