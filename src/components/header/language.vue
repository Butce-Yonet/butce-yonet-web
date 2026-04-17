<template>
    <li class="language-nav" v-click-outside="close">
        <div class="lang-trigger" @click="isActive = !isActive" :class="{ active: isActive }">
            <i class="flag-icon" :class="langIcon"></i>
            <span class="lang-label">{{ langLangauge }}</span>
            <i class="fa fa-angle-down lang-arrow" :class="{ rotated: isActive }"></i>
        </div>

        <div class="lang-dropdown" v-show="isActive">
            <div
                v-for="(l, index) in localOptions"
                :key="index"
                class="lang-option"
                @click="changeLocale(l)"
            >
                <i class="flag-icon" :class="l.icon"></i>
                <span class="lang-option-name">{{ l.name }}</span>
                <span class="lang-option-short">{{ l.short }}</span>
            </div>
        </div>
    </li>
</template>

<script>
import { mapGetters } from 'vuex';
import { localeOptions } from '../../constants/config';

export default {
    name: 'languagePage',
    data() {
        return {
            isActive: false,
            localOptions: localeOptions,
        };
    },
    directives: {
        clickOutside: {
            mounted(el, binding) {
                el._clickOutside = (e) => {
                    if (!el.contains(e.target)) binding.value();
                };
                document.addEventListener('click', el._clickOutside);
            },
            beforeUnmount(el) {
                document.removeEventListener('click', el._clickOutside);
            }
        }
    },
    methods: {
        close() {
            this.isActive = false;
        },
        changeLocale(locale) {
            this.$i18n.locale = locale.id;
            this.$store.dispatch('setLang', locale);
            this.isActive = false;
            window.location.reload();
        },
    },
    computed: {
        ...mapGetters({
            langIcon: 'langIcon',
            langLangauge: 'langLangauge'
        })
    },
    mounted() {
        this.$store.dispatch('setLang', {
            id: localStorage.getItem('currentLanguage') || 'EN',
            icon: localStorage.getItem('currentLanguageIcon') || 'flag-icon-us'
        });
    }
}
</script>

<style scoped>
.language-nav {
    position: relative;
    list-style: none;
    display: flex;
    align-items: center;
}

/* Trigger button */
.lang-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
}

.lang-trigger:hover,
.lang-trigger.active {
    border-color: #10b981;
    background: #f0fdf4;
}

.lang-trigger .flag-icon {
    font-size: 16px;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.lang-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.lang-arrow {
    font-size: 12px;
    color: #9ca3af;
    transition: transform 0.2s;
}

.lang-arrow.rotated {
    transform: rotate(180deg);
}

/* Dropdown */
.lang-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 170px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    z-index: 9999;
}

.lang-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.15s;
}

.lang-option:hover {
    background: #f0fdf4;
}

.lang-option .flag-icon {
    font-size: 16px;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.lang-option-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    flex: 1;
}

.lang-option-short {
    font-size: 11px;
    color: #9ca3af;
}
</style>
