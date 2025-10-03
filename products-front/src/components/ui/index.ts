import DialogComponent from './Dialog.vue'
import LoadingSpinnerComponent from './LoadingSpinner.vue'
import EmptyStateComponent from './EmptyState.vue'
import ErrorBoundaryComponent from './ErrorBoundary.vue'
import InputFieldComponent from './InputField.vue'
import SelectFieldComponent from './SelectField.vue'
import DataTableComponent from './DataTable.vue'
import ProductTableFiltersComponent from './ProductTableFilters.vue'
import PaginationControlsComponent from './PaginationControls.vue'
import BulkActionsComponent from './BulkActions.vue'
import NotificationContainerComponent from './NotificationContainer.vue'
import ErrorStateComponent from './ErrorState.vue'
import LoadingStateComponent from './LoadingState.vue'
import ErrorReportModalComponent from './ErrorReportModal.vue'
import ProductSelectorModalComponent from './ProductSelectorModal.vue'
import ClientFormModalComponent from './ClientFormModal.vue'

export const Dialog = DialogComponent
export const LoadingSpinner = LoadingSpinnerComponent
export const EmptyState = EmptyStateComponent
export const ErrorBoundary = ErrorBoundaryComponent
export const InputField = InputFieldComponent
export const SelectField = SelectFieldComponent
export const DataTable = DataTableComponent
export const ProductTableFilters = ProductTableFiltersComponent
export const PaginationControls = PaginationControlsComponent
export const BulkActions = BulkActionsComponent
export const NotificationContainer = NotificationContainerComponent
export const ErrorState = ErrorStateComponent
export const LoadingState = LoadingStateComponent
export const ErrorReportModal = ErrorReportModalComponent
export const ProductSelectorModal = ProductSelectorModalComponent
export const ClientFormModal = ClientFormModalComponent

// Legacy support
export const ConfirmDialog = DialogComponent

export interface DialogProps {
  show: boolean
  title?: string
  description?: string
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

export interface EmptyStateProps {
  title: string
  description?: string
}