/**
 * timeSlots.js - Time slot definitions for itinerary display
 * Used by Itinerary page to group activities by Sáng/Trưa/Chiều/Tối
 */

// SVG icons as JSX strings (rendered via dangerouslySetInnerHTML or as React components)
const SunIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const CoffeeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
)

const CloudIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
  </svg>
)

const MoonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export const TIME_SLOTS = [
  {
    id: 'MORNING',
    label: 'Sáng',
    svgIcon: SunIcon,
    range: '06:00 – 11:00',
    color: '#374151',
    defaultStart: '08:00',
    defaultEnd: '10:30',
  },
  {
    id: 'NOON',
    label: 'Trưa',
    svgIcon: CoffeeIcon,
    range: '11:00 – 13:00',
    color: '#374151',
    defaultStart: '11:30',
    defaultEnd: '13:00',
  },
  {
    id: 'AFTERNOON',
    label: 'Chiều',
    svgIcon: CloudIcon,
    range: '13:00 – 17:00',
    color: '#374151',
    defaultStart: '14:00',
    defaultEnd: '16:30',
  },
  {
    id: 'EVENING',
    label: 'Tối',
    svgIcon: MoonIcon,
    range: '17:00 – 22:00',
    color: '#374151',
    defaultStart: '18:00',
    defaultEnd: '20:00',
  },
]

/** Get the slot definition by ID */
export function getSlotById(slotId) {
  return TIME_SLOTS.find(s => s.id === slotId) || TIME_SLOTS[0]
}

/** Auto-assign a slot ID based on item index */
export function autoAssignSlot(existingCount) {
  return TIME_SLOTS[existingCount % TIME_SLOTS.length].id
}

/** Get default start/end time for a slot */
export function getSlotDefaults(slotId) {
  const slot = getSlotById(slotId)
  return { startTime: slot.defaultStart, endTime: slot.defaultEnd }
}

/**
 * Group a flat list of itinerary items into { dayNumber, slots: { MORNING: [], ... } }
 * Items without day/timeSlot get auto-assigned
 */
export function groupByDayAndSlot(items) {
  const normalized = items.map((item, i) => ({
    ...item,
    day: item.day || 1,
    timeSlot: item.timeSlot || TIME_SLOTS[i % TIME_SLOTS.length].id,
  }))

  const dayMap = {}
  normalized.forEach(item => {
    const d = item.day
    if (!dayMap[d]) dayMap[d] = {}
    const s = item.timeSlot
    if (!dayMap[d][s]) dayMap[d][s] = []
    dayMap[d][s].push(item)
  })

  return Object.entries(dayMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([dayNum, slots]) => ({ dayNumber: Number(dayNum), slots }))
}
