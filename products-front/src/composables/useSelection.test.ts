import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface TestItem {
  id: string
  name: string
}

describe('useSelection', () => {
  let testItems: TestItem[]

  beforeEach(() => {
    testItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
      { id: '4', name: 'Item 4' }
    ]
  })

  describe('Initialization', () => {
    it('initializes with empty selection', () => {
      const selection = useSelection(testItems)

      expect(selection.selectedIds.value.size).toBe(0)
      expect(selection.selectedCount.value).toBe(0)
      expect(selection.selectedItems.value).toEqual([])
      expect(selection.hasSelection.value).toBe(false)
      expect(selection.allSelected.value).toBe(false)
      expect(selection.someSelected.value).toBe(false)
    })

    it('works with custom getId function', () => {
      const customItems = [
        { customId: 'a', name: 'Item A' },
        { customId: 'b', name: 'Item B' }
      ]
      
      const selection = useSelection(customItems, (item) => item.customId)
      
      selection.select(customItems[0])
      expect(selection.selectedCount.value).toBe(1)
      expect(selection.isSelected(customItems[0])).toBe(true)
    })
  })

  describe('Single Item Selection', () => {
    it('selects an item correctly', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      selection.select(item)

      expect(selection.selectedIds.value.has('1')).toBe(true)
      expect(selection.selectedCount.value).toBe(1)
      expect(selection.selectedItems.value).toEqual([item])
      expect(selection.hasSelection.value).toBe(true)
      expect(selection.isSelected(item)).toBe(true)
    })

    it('deselects an item correctly', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      selection.select(item)
      expect(selection.isSelected(item)).toBe(true)

      selection.deselect(item)
      expect(selection.isSelected(item)).toBe(false)
      expect(selection.selectedCount.value).toBe(0)
      expect(selection.hasSelection.value).toBe(false)
    })

    it('toggles item selection', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      // Toggle to select
      selection.toggle(item)
      expect(selection.isSelected(item)).toBe(true)
      expect(selection.selectedCount.value).toBe(1)

      // Toggle to deselect
      selection.toggle(item)
      expect(selection.isSelected(item)).toBe(false)
      expect(selection.selectedCount.value).toBe(0)
    })

    it('prevents duplicate selections', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      selection.select(item)
      selection.select(item) // Select again
      
      expect(selection.selectedCount.value).toBe(1)
      expect(selection.selectedItems.value).toHaveLength(1)
    })
  })

  describe('Bulk Selection Operations', () => {
    it('selects all items', () => {
      const selection = useSelection(testItems)

      selection.selectAll()

      expect(selection.selectedCount.value).toBe(testItems.length)
      expect(selection.allSelected.value).toBe(true)
      expect(selection.hasSelection.value).toBe(true)
      expect(selection.selectedItems.value).toEqual(testItems)
      
      testItems.forEach(item => {
        expect(selection.isSelected(item)).toBe(true)
      })
    })

    it('deselects all items', () => {
      const selection = useSelection(testItems)

      // First select all
      selection.selectAll()
      expect(selection.selectedCount.value).toBe(testItems.length)

      // Then deselect all
      selection.deselectAll()
      expect(selection.selectedCount.value).toBe(0)
      expect(selection.allSelected.value).toBe(false)
      expect(selection.hasSelection.value).toBe(false)
      expect(selection.selectedItems.value).toEqual([])
    })

    it('toggles all items when none selected', () => {
      const selection = useSelection(testItems)

      selection.toggleAll()

      expect(selection.allSelected.value).toBe(true)
      expect(selection.selectedCount.value).toBe(testItems.length)
    })

    it('toggles all items when all selected', () => {
      const selection = useSelection(testItems)

      selection.selectAll()
      expect(selection.allSelected.value).toBe(true)

      selection.toggleAll()
      expect(selection.allSelected.value).toBe(false)
      expect(selection.selectedCount.value).toBe(0)
    })

    it('toggles all items when some selected', () => {
      const selection = useSelection(testItems)

      // Select some items
      selection.select(testItems[0])
      selection.select(testItems[1])
      expect(selection.someSelected.value).toBe(true)

      // Toggle all should select all
      selection.toggleAll()
      expect(selection.allSelected.value).toBe(true)
    })
  })

  describe('Selection by IDs', () => {
    it('selects items by ID array', () => {
      const selection = useSelection(testItems)
      const idsToSelect = ['1', '3']

      selection.selectByIds(idsToSelect)

      expect(selection.selectedCount.value).toBe(2)
      expect(selection.isSelected(testItems[0])).toBe(true)
      expect(selection.isSelected(testItems[2])).toBe(true)
      expect(selection.isSelected(testItems[1])).toBe(false)
    })

    it('deselects items by ID array', () => {
      const selection = useSelection(testItems)

      // First select multiple items
      selection.selectByIds(['1', '2', '3'])
      expect(selection.selectedCount.value).toBe(3)

      // Deselect some
      selection.deselectByIds(['1', '3'])
      
      expect(selection.selectedCount.value).toBe(1)
      expect(selection.isSelected(testItems[0])).toBe(false)
      expect(selection.isSelected(testItems[1])).toBe(true)
      expect(selection.isSelected(testItems[2])).toBe(false)
    })

    it('handles non-existent IDs gracefully', () => {
      const selection = useSelection(testItems)

      selection.selectByIds(['1', 'non-existent', '2'])
      
      expect(selection.selectedCount.value).toBe(3) // All IDs are added to Set, including non-existent
      expect(selection.selectedIds.value.has('non-existent')).toBe(true)
      expect(selection.selectedItems.value).toHaveLength(2) // Only existing items returned
    })
  })

  describe('Computed Properties', () => {
    it('correctly computes someSelected state', () => {
      const selection = useSelection(testItems)

      // No selection
      expect(selection.someSelected.value).toBe(false)

      // Some selected
      selection.select(testItems[0])
      selection.select(testItems[1])
      expect(selection.someSelected.value).toBe(true)
      expect(selection.allSelected.value).toBe(false)

      // All selected
      selection.selectAll()
      expect(selection.someSelected.value).toBe(false)
      expect(selection.allSelected.value).toBe(true)
    })

    it('handles empty items array', () => {
      const selection = useSelection([])

      expect(selection.allSelected.value).toBe(false)
      expect(selection.someSelected.value).toBe(false)
      expect(selection.selectedCount.value).toBe(0)
      expect(selection.hasSelection.value).toBe(false)
    })

    it('updates selectedItems reactively', () => {
      const selection = useSelection(testItems)

      expect(selection.selectedItems.value).toEqual([])

      selection.select(testItems[0])
      expect(selection.selectedItems.value).toEqual([testItems[0]])

      selection.select(testItems[2])
      expect(selection.selectedItems.value).toEqual([testItems[0], testItems[2]])

      selection.deselect(testItems[0])
      expect(selection.selectedItems.value).toEqual([testItems[2]])
    })
  })

  describe('Reactive Updates', () => {
    it('updates when items array changes', () => {
      const itemsRef = ref(testItems.slice(0, 2))
      const selection = useSelection(itemsRef.value)

      selection.selectAll()
      expect(selection.selectedCount.value).toBe(2)

      // Change items array
      itemsRef.value = testItems
      const newSelection = useSelection(itemsRef.value)
      newSelection.selectAll()
      
      expect(newSelection.selectedCount.value).toBe(4)
    })
  })

  describe('Edge Cases', () => {
    it('handles selecting same item multiple times', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      selection.select(item)
      selection.select(item)
      selection.select(item)

      expect(selection.selectedCount.value).toBe(1)
      expect(selection.selectedItems.value).toHaveLength(1)
    })

    it('handles deselecting non-selected item', () => {
      const selection = useSelection(testItems)
      const item = testItems[0]

      selection.deselect(item) // Item not selected

      expect(selection.selectedCount.value).toBe(0)
      expect(selection.hasSelection.value).toBe(false)
    })

    it('handles empty ID arrays in bulk operations', () => {
      const selection = useSelection(testItems)

      selection.selectByIds([])
      expect(selection.selectedCount.value).toBe(0)

      selection.select(testItems[0])
      selection.deselectByIds([])
      expect(selection.selectedCount.value).toBe(1)
    })
  })

  describe('Integration Scenarios', () => {
    it('supports complex selection workflows', () => {
      const selection = useSelection(testItems)

      // Select some items
      selection.select(testItems[0])
      selection.select(testItems[1])
      expect(selection.someSelected.value).toBe(true)

      // Toggle to select all
      selection.toggleAll()
      expect(selection.allSelected.value).toBe(true)

      // Deselect one item
      selection.deselect(testItems[0])
      expect(selection.someSelected.value).toBe(true)

      // Clear all
      selection.deselectAll()
      expect(selection.hasSelection.value).toBe(false)
    })

    it('maintains consistency across different operations', () => {
      const selection = useSelection(testItems)

      // Mix of individual and bulk operations
      selection.select(testItems[0])
      selection.selectByIds(['2', '3'])
      selection.toggle(testItems[3])
      
      expect(selection.selectedCount.value).toBe(4)
      expect(selection.allSelected.value).toBe(true)

      selection.deselectByIds(['1', '4'])
      expect(selection.selectedCount.value).toBe(2)
      expect(selection.someSelected.value).toBe(true)
    })
  })
})