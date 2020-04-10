/**
 * mock
 */
const usersData = {
  id: 1023,
  firstName: "Jumping",
  lastName: "Spider",
};

const brandData = {
  id: 111,
  name: "Aaa",
};

const companyData = {
  id: 15,
  name: "AAA",
  phone: "12345-6789",
};

const mock = (value, success = true, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(value);
      } else {
        reject({ message: "Error" });
      }
    }, timeout);
  });
};

const getUser = async () => {
  try {
    console.count("getUsers");
    const response = await mock(usersData);
    return response;
  } catch (e) {
    console.log(e);
  }
};

const getBrand = async () => {
  try {
    console.count("getBrand");
    const response = await mock(brandData);
    return response;
  } catch (e) {
    console.log(e);
  }
};

const getCompany = async () => {
  try {
    console.count("getCompany");
    const response = await mock(companyData);
    return response;
  } catch (e) {
    console.log(e);
  }
};

/**
 * application
 */
async function* clientFilterGenerator() {
  const baseConfig = {
    token: "aoeuidhtnspyfgcqjkxbm",
  };

  const nextValue = yield baseConfig;
  const user = nextValue === "user" ? await getUser() : undefined;

  const nextValue2 = yield { user };
  const company = nextValue2 === "company" ? await getCompany() : undefined;

  const nextValue3 = yield { company };
  const brand = nextValue3 === "brand" ? await getBrand() : undefined;

  return { brand };
}

const getClientfilter = async () => {
  const iter = await clientFilterGenerator();

  const res1 = await iter.next();
  const res2 = await iter.next("user");
  const res3 = await iter.next("company");
  const res4 = await iter.next("brand");

  return {
    ...res1.value,
    ...res2.value,
    ...res3.value,
    ...res4.value,
  };
};

(async () => {
  try {
    console.log(` ----- ----- "Fetching" ----- ----- `);
    const config = await getClientfilter();

    console.log(` ----- ----- "Data" ----- ----- `);
    console.log(JSON.stringify(config, null, 2));
  } catch (e) {
    console.log("e", e);
  }
})();
