<template>
    <div className="leftSidebarLogo">
        <img src="../../public/logo.svg" />
    </div>
    <div className="navigation">
        <div class="itemsNav">
            <button :class="[activeNav == ITEMS ? 'activeNav' : '']" @click="emit('toggleNav', ITEMS)">
                <unicon name="list-ul"></unicon>
            </button>
            <div className="tooltip">items</div>
        </div>
        <div class="historyNav">
            <button :disabled="userItems.length === 0" :class="[activeNav == HISTORY ? 'activeNav' : '']"
                @click="emit('toggleNav', HISTORY)">
                <unicon name="redo"></unicon>
            </button>
            <div className="tooltip">history</div>
        </div>
        <div class="statisticsNav">
            <button :disabled="userItems.length === 0" :class="[activeNav == STATISTICS ? 'activeNav' : '']"
                @click="emit('toggleNav', STATISTICS)">
                <unicon name="chart"></unicon>
            </button>
            <div className="tooltip">statistics</div>
        </div>
    </div>
    <div>
        <div class="cart" @click="emit('toggleSideBar')">
            <unicon name="shopping-cart"></unicon>
        </div>
    </div>
</template>
<script setup>

const ITEMS = 'items'
const HISTORY = 'history'
const STATISTICS = 'statistics'
const { userItems, activeNav } = defineProps(['userItems', 'activeNav'])
const emit = defineEmits(['toggleSideBar', 'toggleNav'])


</script>
