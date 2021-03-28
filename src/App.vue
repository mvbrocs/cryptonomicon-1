<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!--    <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">-->
    <!--      <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">-->
    <!--        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>-->
    <!--        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>-->
    <!--      </svg>-->
    <!--    </div>-->
    <div class="container">
      <section>
        <form @submit.prevent="add">
          <div class="flex">
            <div class="max-w-xs">
              <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
              <div class="mt-1 relative rounded-md shadow-md">
                <input
                  v-model="ticker"
                  type="text"
                  name="wallet"
                  id="wallet"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например DOGE"
                />
              </div>
              <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
                <span
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  BTC
                </span>
                <span
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  DOGE
                </span>
                <span
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  BCH
                </span>
                <span
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  CHD
                </span>
              </div>
              <div class="text-sm text-red-600">Такой тикер уже добавлен</div>
            </div>
          </div>
          <button
            type="submit"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <!-- Heroicon name: solid/mail -->
            <svg
              class="-ml-0.5 mr-2 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="#ffffff"
            >
              <path
                d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              ></path>
            </svg>
            Добавить
          </button>
        </form>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Ticker
            v-for="t in tickers"
            :key="t.name"
            @click="select(t)"
            @remove="remove(t.name)"
            :class="{
              'border-4': t.name === sel?.name,
            }"
            :t="t"
          />
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <Graph v-if="sel" @close="sel = null" :dots="normalizeGraphDots" />
    </div>
  </div>
</template>

<script>
import Ticker from '@/Ticker.vue';
import Graph from '@/Graph.vue';
import api from '@/api';

const defaultPrice = '-';

export default {
  name: 'App',
  components: { Ticker, Graph },
  data: () => ({
    ticker: '',
    tickers: [],
    sel: null,
    graphDots: [],
  }),
  computed: {
    normalizeGraphDots() {
      return this.graphDots.map((price) => {
        const maxPrice = Math.max(...this.graphDots);
        const minPrice = Math.min(...this.graphDots);
        const newPrice = (price - minPrice) / (maxPrice - minPrice) || 0;

        return 5 + newPrice * 95;
      });
    },
  },
  methods: {
    add() {
      const ticker = {
        name: this.ticker.toUpperCase(),
        price: defaultPrice,
        intervalId: null,
      };

      this.tickers.push(ticker);
      this.ticker = '';

      ticker.intervalId = setInterval(async () => {
        const price = await api.getPrice(ticker.name);
        const currentTicker = this.tickers.find((t) => t.name === ticker.name);

        currentTicker.price = price > 1 ? price.toFixed(2) : price.toPrecision(2);

        if (this.sel?.name === currentTicker.name) this.graphDots.push(price);
      }, 3000);
    },

    remove(name) {
      this.tickers = this.tickers.filter((ticker) => {
        if (ticker.name !== name) return true;

        this.sel = null;
        clearInterval(ticker.intervalId);

        return false;
      });
    },

    select(ticker) {
      this.graphDots = [];
      this.sel = ticker;
    },
  },
};
</script>

<style src="./app.css"></style>
