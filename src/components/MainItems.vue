<template>
    <div class="category" v-for="(category, index) in categories" :key="index">
        <p class="itemCategory">{{ category }}</p>
        <div class="categoryContents">
            <div v-for="(item, index) in theItems[category]" class="item">
                <p @click="emit('handleClickItem', item)">{{ item.name }}</p>
                <button @click="emit('handleAddItem', item)" v-if="activeNav == 'items'">
                    <unicon name="plus" width="20" fill="rgba(193, 193, 196, 1)"></unicon>
                </button>
                <span v-if="activeNav == 'history'" class="pcs"><strong>{{ item.quantity }}</strong> pcs</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue';
const { categories, items, userId, activeNav } = defineProps(['categories', 'items', 'userId', 'activeNav'])
const emit = defineEmits(['handleClickItem', 'handleAddItem'])

const theItems = ref({})

const groupItemsByCategory = (items) => {
    const grouped = {};
    for (const item of items) {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item)
    }
    return grouped;
};

watchEffect(() => {
    theItems.value = groupItemsByCategory(items);
})

const groupedItems = computed(() => {
    return groupItemsByCategory(items)
})

// const groupedShoplistItems = computed(() => {
//   return groupItemsByCategory(viewingList.value.items);
// });

// const groupedListItems = computed(() => {
//   return groupItemsByCategory(shoppingList.value);
// });
</script>