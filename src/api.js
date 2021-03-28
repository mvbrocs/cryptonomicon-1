const getPrice = async (ticker) => {
  const f = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${ticker}&tsyms=USD`);
  const data = await f.json();

  return data.USD;
};

export default {
  getPrice,
};
