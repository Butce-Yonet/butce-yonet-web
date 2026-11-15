<template>
  <div class="page">
    <div class="page-head cal-head">
      <div class="row cal-nav">
        <button type="button" class="btn-icon bordered" :aria-label="$t('common.previous')" @click="shiftMonth(-1)">
          <vue-feather type="chevron-left" size="18"></vue-feather>
        </button>
        <h2 class="cal-month">{{ monthTitle }}</h2>
        <button type="button" class="btn-icon bordered" :aria-label="$t('common.next')" @click="shiftMonth(1)">
          <vue-feather type="chevron-right" size="18"></vue-feather>
        </button>
        <button v-if="!isCurrentMonth" type="button" class="btn btn-secondary btn-sm" @click="goToday">
          {{ $t('calendarPage.today') }}
        </button>
      </div>

      <div v-if="calendarData" class="cal-totals">
        <div class="cal-total">
          <span class="muted">{{ $t('common.income') }}</span>
          <strong class="tabular income-text">+{{ number(calendarData.totalIncome) }}</strong>
        </div>
        <div class="cal-total">
          <span class="muted">{{ $t('common.expense') }}</span>
          <strong class="tabular">−{{ number(calendarData.totalExpense) }}</strong>
        </div>
        <div class="cal-total">
          <span class="muted">{{ $t('reports.periodSummary.netBalance') }}</span>
          <strong class="tabular" :class="calendarData.netBalance >= 0 ? 'income-text' : 'expense-text'">
            {{ number(calendarData.netBalance) }}
          </strong>
        </div>
      </div>
    </div>

    <div class="card cal-card" :class="{ 'is-loading': loading }">
      <div class="cal-weekdays">
        <div v-for="wd in weekdayLabels" :key="wd.text" class="cal-wd" :class="{ weekend: wd.isWeekend }">{{ wd.text }}</div>
      </div>

      <div class="cal-grid">
        <button
          v-for="cell in cells"
          :key="cell.iso"
          type="button"
          class="cal-cell"
          :class="{ out: !cell.inMonth, today: cell.isToday, weekend: cell.isWeekend, has: cell.count > 0 }"
          @click="openDay(cell)"
        >
          <span class="cal-date">{{ cell.date.date() }}</span>

          <span v-if="cell.count" class="cal-count hide-mobile">{{ cell.count }}</span>

          <span v-if="cell.dayData && cell.count" class="cal-previews hide-mobile">
            <span
              v-for="tx in cell.dayData.previewTransactions"
              :key="tx.id"
              class="cal-preview"
              :class="tone(tx.transactionType)"
            >
              <span class="truncate">{{ tx.name }}</span>
              <span class="tabular">{{ sign(tx.transactionType) }}{{ compact(tx.amount, tx.currency?.code) }}</span>
            </span>
            <span v-if="cell.count > (cell.dayData.previewTransactions?.length || 0)" class="cal-more">
              {{ $t('calendarPage.more', { count: cell.count - (cell.dayData.previewTransactions?.length || 0) }) }}
            </span>
          </span>

          <span v-if="cell.dayData && cell.count" class="cal-dots show-mobile">
            <i v-for="(tx, i) in (cell.dayData.previewTransactions || []).slice(0, 3)" :key="i" :class="tone(tx.transactionType)"></i>
          </span>
        </button>
      </div>
    </div>

    <day-detail-modal
      :open="dayOpen"
      :date="selectedDate"
      :transactions="dayTransactions"
      :loading="dayLoading"
      @close="dayOpen = false"
      @edit="editTx"
      @add="addForDay"
    />
  </div>
</template>

<script>
import moment from 'moment';
import DayDetailModal from '@/components/calendar/dayDetailModal.vue';
import transactionService from '@/services/transaction.service';
import { formatMoney, formatNumber, txTone, txSign } from '@/utils/format';

export default {
  name: 'CalendarPage',
  components: { DayDetailModal },
  data() {
    return {
      currentDate: moment().startOf('month'),
      calendarData: null,
      loading: false,
      dayOpen: false,
      selectedDate: null,
      dayTransactions: [],
      dayLoading: false,
    };
  },
  computed: {
    monthTitle() {
      return this.currentDate.clone().locale(this.$i18n.locale).format('MMMM YYYY');
    },
    isCurrentMonth() {
      return this.currentDate.isSame(moment(), 'month');
    },
    weekdayLabels() {
      const start = moment().locale(this.$i18n.locale).startOf('isoWeek');
      return Array.from({ length: 7 }, (_, i) => {
        const day = start.clone().add(i, 'days');
        return { text: day.format('ddd'), isWeekend: day.isoWeekday() >= 6 };
      });
    },
    dayMap() {
      const map = {};
      (this.calendarData?.days || []).forEach((d) => {
        map[moment(d.date).format('YYYY-MM-DD')] = d;
      });
      return map;
    },
    cells() {
      const start = this.currentDate.clone().startOf('month').startOf('isoWeek');
      const end = this.currentDate.clone().endOf('month').endOf('isoWeek');
      const today = moment();
      const out = [];
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, 'day')) {
        const iso = cursor.format('YYYY-MM-DD');
        const dayData = this.dayMap[iso] || null;
        out.push({
          date: cursor.clone(),
          iso,
          inMonth: cursor.month() === this.currentDate.month(),
          isToday: cursor.isSame(today, 'day'),
          isWeekend: cursor.isoWeekday() >= 6,
          dayData,
          count: dayData?.transactionCount || 0,
        });
        cursor.add(1, 'day');
      }
      return out;
    },
    version() {
      return this.$store.state.ui.versions.transactions;
    },
  },
  watch: {
    version() {
      this.loadCalendar();
    },
  },
  mounted() {
    this.loadCalendar();
  },
  methods: {
    tone: txTone,
    sign: txSign,
    number(v) {
      return formatNumber(v);
    },
    compact(amount, code) {
      return formatMoney(amount, code, { compact: Math.abs(amount) >= 10000, decimals: Math.abs(amount) >= 100 ? 0 : 2 });
    },
    async loadCalendar() {
      this.loading = true;
      try {
        const response = await transactionService.getCalendar({
          Year: this.currentDate.year(),
          Month: this.currentDate.month() + 1,
          PreviewCount: 3,
        });
        if (response.status !== 200) throw new Error('load failed');
        this.calendarData = response.data.data;
      } catch {
        this.$toast.error(this.$t('calendarPage.messages.calendarLoadError'));
      } finally {
        this.loading = false;
      }
    },
    shiftMonth(n) {
      this.currentDate = this.currentDate.clone().add(n, 'month');
      this.loadCalendar();
    },
    goToday() {
      this.currentDate = moment().startOf('month');
      this.loadCalendar();
    },
    async openDay(cell) {
      this.selectedDate = cell.date.toDate();
      this.dayTransactions = [];
      this.dayOpen = true;
      if (!cell.count) return;
      this.dayLoading = true;
      try {
        const response = await transactionService.getAllTransactions({
          PageNumber: 1,
          PageSize: 100,
          SortColumn: '',
          SortDirection: 'Ascending',
          StartTime: moment(this.selectedDate).startOf('day').toISOString(),
          EndTime: moment(this.selectedDate).endOf('day').toISOString(),
        });
        if (response.status !== 200) throw new Error('load failed');
        this.dayTransactions = response.data.data.items || [];
      } catch {
        this.$toast.error(this.$t('calendarPage.messages.dayTransactionsLoadError'));
      } finally {
        this.dayLoading = false;
      }
    },
    editTx(tx) {
      if (tx.transactionType === 2) {
        this.$toast.info(this.$t('transactionList.savingLocked'));
        return;
      }
      this.dayOpen = false;
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'edit', data: tx });
    },
    addForDay() {
      this.dayOpen = false;
      const date = moment(this.selectedDate).hour(12).toDate();
      this.$store.dispatch('ui/openModal', { type: 'transaction', mode: 'create', data: { transactionDate: date } });
    },
  },
};
</script>

<style scoped>
.cal-head {
  align-items: center;
}

.cal-nav {
  gap: 10px;
}

.cal-month {
  min-width: 170px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  text-transform: capitalize;
}

.cal-totals {
  display: flex;
  gap: 24px;
}

.cal-total {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  line-height: 1.3;
}

.cal-total strong {
  font-size: 15px;
  font-weight: 700;
}

.income-text { color: var(--income); }
.expense-text { color: var(--expense); }

.cal-card {
  overflow: hidden;
  transition: opacity 0.15s;
}

.cal-card.is-loading {
  opacity: 0.6;
}

.cal-weekdays,
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.cal-wd {
  padding: 10px 8px;
  font-size: 12px;
  font-weight: 650;
  color: var(--text-3);
  text-transform: capitalize;
  border-bottom: 1px solid var(--border);
}

.cal-wd.weekend {
  color: var(--warning);
}

.cal-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  min-height: 116px;
  padding: 8px;
  border: 0;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  color: var(--text);
  transition: background 0.12s;
  min-width: 0;
}

.cal-cell:nth-child(7n) {
  border-right: 0;
}

.cal-cell:hover {
  background: var(--surface-2);
}

.cal-cell.out {
  background: var(--surface-2);
}

.cal-cell.out .cal-date {
  color: var(--text-3);
  opacity: 0.6;
}

.cal-date {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 650;
}

.cal-cell.today .cal-date {
  background: var(--primary);
  color: #fff;
}

.cal-count {
  position: absolute;
  top: 10px;
  right: 8px;
  font-size: 11px;
  font-weight: 650;
  color: var(--text-3);
}

.cal-previews {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cal-preview {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  min-width: 0;
}

.cal-preview .tabular {
  flex-shrink: 0;
  white-space: nowrap;
}

.cal-preview.income { background: var(--income-soft); color: var(--income); }
.cal-preview.expense { background: var(--expense-soft); color: var(--expense); }
.cal-preview.saving { background: var(--saving-soft); color: var(--saving); }

.cal-more {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  padding: 0 6px;
}

.cal-dots {
  display: flex;
  gap: 3px;
  justify-content: center;
}

.cal-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.cal-dots i.income { background: var(--income); }
.cal-dots i.expense { background: var(--expense); }
.cal-dots i.saving { background: var(--saving); }

@media (max-width: 767px) {
  .cal-head {
    flex-direction: column;
    align-items: stretch;
  }

  .cal-nav {
    justify-content: space-between;
  }

  .cal-month {
    flex: 1;
    min-width: 0;
  }

  .cal-totals {
    justify-content: space-between;
    gap: 12px;
  }

  .cal-cell {
    min-height: 58px;
    align-items: center;
    padding: 6px 2px;
  }

  .cal-wd {
    text-align: center;
    padding: 8px 2px;
  }
}
</style>
