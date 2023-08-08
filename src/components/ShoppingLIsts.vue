<template>
    <div v-for="(lists, date) in groupedShopLists" :key="lists.name">
        <p class="groupListDate">{{ date }}</p>
        <div className="listItem" @click="emit('viewListToggle', list)" v-for="list in lists" :key="list.name">
            <p className="shopListName">{{ list.name }}</p>
            <div className="shopListDetails">
                <span className="shopListDate">{{ formatTimestamp(list.timestamp) }}</span>
                <span :class="[list.completed ? 'completed' : 'ongoing']" v-if="!list.cancelled">{{ list.completed ?
                    'completed' : 'ongoing' }}</span>
                <span class="cancelled" v-else>cancelled</span>
            </div>
        </div>
    </div>
</template>
<script setup>

const { groupedShopLists, formatTimestamp } = defineProps(['groupedShopLists', 'formatTimestamp'])

const emit = defineEmits(['viewListToggle'])

</script>