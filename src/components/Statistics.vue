<template>
    <div class="content">
        <div class="topStatistics">

            <div class="topItems" v-if="topItemCounts.length > 0">
                <p class="topTitle">Top items</p>

                <div v-for="( item, index ) in  topItemCounts.slice(0, 3) " :key="index">
                    <div class="itemStatContainer">
                        <div class="itemName">
                            <p>{{ item[0] }}</p>
                            <!-- <p>{{ parseInt(item[1] / allItemCounts * 100) }}%</p> -->
                            <p>{{ (item[1] / allItemCounts * 100).toFixed(1) }}%</p>
                        </div>
                        <div class="itemStatBar">
                            <div class="fill" :style="{ width: parseInt(item[1] / allItemCounts * 100) + '%' }"></div>
                            <div class="back"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="topCategories" v-if="topCategoryCounts.length > 0">
                <p class="topTitle">Top Categories</p>

                <div v-for="( category, index ) in  topCategoryCounts.slice(0, 3) " :key="index">
                    <div class="itemStatContainer">
                        <div class="categoryName">
                            <p>{{ category[0] }}</p>
                            <!-- <p>{{ topCategoryPercentages[index].toFixed(1) }}%</p> -->
                            <p>{{ (category[1] / allItemCounts * 100).toFixed(1) }}</p>
                        </div>
                        <div class="itemStatBar">
                            <div class="fillBlue" :style="{ width: parseInt(category[1] / allItemCounts * 100) + '%' }">
                            </div>
                            <div class="back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="monthlySummary">
            <p class="topTitle">Monthly Summary</p>
            <div class="chartContainer" v-if="chartData">
                <Line :data="chartData" :options="{ responsive: true, maintainAspectRatio: false }" />
            </div>
        </div>
    </div>
</template>
<script setup>
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { ref, onMounted } from 'vue';
import { Line } from 'vue-chartjs'

const { groupedShopLists } = defineProps(['groupedShopLists'])

const itemsPerMonth = ref()
const calculateItemsPerMonth = () => {
    const grouped = {}
    for (let key in groupedShopLists) {
        for (let date of groupedShopLists[key]) {
            if (!grouped[key]) {
                grouped[key] = date.items.length
            } else {
                grouped[key] += date.items.length
            }
        }
    }
    itemsPerMonth.value = grouped
};
const chartData = ref()
// const chartOptions = ref({ responsive: true })
const chartDataGen = () => {
    const data = {
        labels: [],
        datasets: [
            {
                label: 'items',
                backgroundColor: 'rgba(249, 161, 9, 1)',
                data: []
            }
        ]
    }

    for (let key in itemsPerMonth.value) {
        data.labels.push(key)
        data.datasets[0].data.push(itemsPerMonth.value[key])
    }
    chartData.value = data
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const topItemCounts = ref([]);
const topCategoryCounts = ref([]);
const allItemCounts = ref();
const topItemPercentages = ref();
const topCategoryPercentages = ref();

const countItems = (shoppingLists) => {
    const itemCounts = {};
    const categoryCounts = {};
    let totalItems = 0;

    for (const shoplist in shoppingLists) {
        console.log(shoplist)
        const items = shoppingLists[shoplist][0].items;
        totalItems += items.length;

        for (const item of items) {
            const itemName = item.name;
            const itemCategory = item.category;

            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
            categoryCounts[itemCategory] = (categoryCounts[itemCategory] || 0) + 1;
        }
    }

    return { itemCounts, categoryCounts, totalItems };
};

const calculateTopPercentages = (counts, limit) => {
    const keyValueArray = Object.entries(counts);
    const sortedArray = keyValueArray.sort((a, b) => b[1] - a[1]);
    console.log(sortedArray)
    const percentages = [];

    for (const item of sortedArray) {
        if (percentages.length < limit) {
            const percentage = (item[1] / allItemCounts.value) * 100;
            percentages.push(percentage);
        }
    }

    return percentages;
};

const countTops = () => {
    const grouped = groupedShopLists;
    const { itemCounts, categoryCounts, totalItems } = countItems(grouped);

    topItemCounts.value = Object.entries(itemCounts);
    topCategoryCounts.value = Object.entries(categoryCounts);
    allItemCounts.value = totalItems;
    topItemPercentages.value = calculateTopPercentages(itemCounts, 3);
    topCategoryPercentages.value = calculateTopPercentages(categoryCounts, 3);
};

onMounted(() => {
    calculateItemsPerMonth()
    countTops()
    chartDataGen()
})
</script>