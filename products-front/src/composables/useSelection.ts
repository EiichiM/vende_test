/**
 * useSelection - Multi-selection management composable
 * Handles bulk operations and selection state
 */

import { ref, computed } from 'vue'

export function useSelection<T>(
  items: T[],
  getId: (item: T) => string = (item: any) => item.id
) {
  const selectedIds = ref<Set<string>>(new Set())

  // Computed properties
  const selectedItems = computed(() =>
    items.filter(item => selectedIds.value.has(getId(item)))
  )

  const selectedCount = computed(() => selectedIds.value.size)

  const allSelected = computed(() => 
    items.length > 0 && items.every(item => selectedIds.value.has(getId(item)))
  )

  const someSelected = computed(() => 
    selectedIds.value.size > 0 && !allSelected.value
  )

  const hasSelection = computed(() => selectedIds.value.size > 0)

  // Methods
  const select = (item: T) => {
    selectedIds.value.add(getId(item))
  }

  const deselect = (item: T) => {
    selectedIds.value.delete(getId(item))
  }

  const toggle = (item: T) => {
    const id = getId(item)
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  const selectAll = () => {
    items.forEach(item => {
      selectedIds.value.add(getId(item))
    })
  }

  const deselectAll = () => {
    selectedIds.value.clear()
  }

  const toggleAll = () => {
    if (allSelected.value) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const isSelected = (item: T) => {
    return selectedIds.value.has(getId(item))
  }

  const selectByIds = (ids: string[]) => {
    ids.forEach(id => selectedIds.value.add(id))
  }

  const deselectByIds = (ids: string[]) => {
    ids.forEach(id => selectedIds.value.delete(id))
  }

  return {
    // State
    selectedIds,
    
    // Computed
    selectedItems,
    selectedCount,
    allSelected,
    someSelected,
    hasSelection,
    
    // Methods
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
    selectByIds,
    deselectByIds
  }
}