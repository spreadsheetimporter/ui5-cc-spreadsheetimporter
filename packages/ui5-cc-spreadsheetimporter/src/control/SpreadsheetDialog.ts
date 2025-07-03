import Dialog from 'sap/m/Dialog';
import type { MetadataOptions } from 'sap/ui/core/Element';
import { AvailableOptions } from '../enums';
import SpreadsheetDialogRenderer from './SpreadsheetDialogRenderer';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import TextToWorkbookService from '../controller/services/TextToWorkbookService';
import MessageToast from 'sap/m/MessageToast';
import Log from 'sap/base/Log';
/**
 * Constructor for a new <code>cc.spreadsheetimporter.XXXnamespaceXXX.SpreadsheetDialog</code> control.
 *
 * Some class description goes here.
 * @extends Dialog
 *
 * @constructor
 * @public
 * @name cc.spreadsheetimporter.XXXnamespaceXXX.SpreadsheetDialog
 */
export default class SpreadsheetDialog extends Dialog {
  dropMessageShown: boolean;
  private textToWorkbookService: TextToWorkbookService;
  private readonly _onPaste = (event: Event) => this.handlePaste(event);

  constructor(id?: string | $SpreadsheetDialogSettings);
  constructor(id?: string, settings?: $SpreadsheetDialogSettings);
  constructor(id?: string, settings?: $SpreadsheetDialogSettings) {
    super(id, settings);
    this.dropMessageShown = false;
    this.textToWorkbookService = new TextToWorkbookService();
  }

  static readonly metadata: MetadataOptions = {
    properties: {
      decimalSeparator: { type: 'string' },
      availableOptions: { type: 'string[]' },
      component: { type: 'object' }
    },
    events: {
      fileDrop: {
        parameters: {
          files: { type: 'object[]' }
        }
      },
      dataPaste: {
        parameters: {
          workbook: { type: 'object' },
          type: { type: 'string' },
          originalData: { type: 'string' }
        }
      },
      decimalSeparatorChanged: {
        parameters: {
          decimalSeparator: { type: 'string' }
        }
      },
      availableOptionsChanged: {
        parameters: {
          availableOptions: { type: 'string[]' }
        }
      }
    }
  };

  onAfterRendering(event: any) {
    super.onAfterRendering(event);
    const domRef = this.getDomRef();

    // Drag and drop events
    domRef.addEventListener('dragover', this.handleDragOver.bind(this), false);
    domRef.addEventListener('dragenter', this.handleDragEnter.bind(this), false);
    domRef.addEventListener('dragleave', this.handleDragLeave.bind(this), false);
    domRef.addEventListener('drop', this.handleFileDrop.bind(this), false);

    // Paste events - use stable handler reference on DOM element
    domRef.addEventListener('paste', this._onPaste);
  }

  private handleDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';

    if (!this.dropMessageShown) {
      this.showDropMessage(true);
    }
  }

  private handleDragLeave(event: any) {
    // Check if the drag is actually leaving the dialog, not just moving between children
    if (!event.currentTarget.contains(event.relatedTarget)) {
      this.showDropMessage(false);
    }
  }

  private handleFileDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.showDropMessage(false);
    const files = event.dataTransfer.files;
    this.fireFileDrop({ files: files } as SpreadsheetDialog$FileDropEventParameters);
  }

  private handleDragEnter(event: any) {}

  /**
   * Handle paste events - improved with better guards and busy state
   * @param event - Browser paste event
   */
  private async handlePaste(event: Event): Promise<void> {
    const clipboardEvent = event as ClipboardEvent;

    // Early-exit guard order (check cheap conditions first)
    if (!this.isOpen() || !clipboardEvent.isTrusted) {
      return;
    }

    const clipboardData = clipboardEvent.clipboardData;
    if (!clipboardData) {
      return;
    }

    // Check if this dialog should handle the paste
    const dialogDomRef = this.getDomRef();
    const activeElement = document.activeElement;

    // Only handle if the paste is relevant to our dialog
    if (!dialogDomRef || !dialogDomRef.contains(activeElement as Node)) {
      return;
    }

    // Prevent default paste behavior and stop immediate propagation
    clipboardEvent.preventDefault();
    clipboardEvent.stopImmediatePropagation();

    try {
      // Show busy indicator for large data processing
      this.setBusy(true);

      // Show processing message
      const resourceBundle = (this.getModel('i18n') as ResourceModel)?.getResourceBundle() as ResourceBundle;
      if (resourceBundle) {
        MessageToast.show(resourceBundle.getText('spreadsheetimporter.pasteDetected'));
      }

      // Process clipboard data using the service
      const result = await this.textToWorkbookService.processClipboardData(clipboardData);

      if (result.workbook) {
        // Get original data for debugging/logging purposes
        let originalData = '';
        if (result.type === 'text') {
          originalData = clipboardData.getData('text/plain');
        } else if (result.type === 'file') {
          const files = clipboardData.files;
          originalData = files.length > 0 ? files[0].name : '';
        }

        // Fire the dataPaste event
        this.fireDataPaste({
          workbook: result.workbook,
          type: result.type,
          originalData: originalData
        } as SpreadsheetDialog$DataPasteEventParameters);

        // Show success message
        if (resourceBundle) {
          const messageKey = result.type === 'file' ? 'spreadsheetimporter.pasteFileSuccess' : 'spreadsheetimporter.pasteTextSuccess';
          MessageToast.show(resourceBundle.getText(messageKey));
        }
      } else {
        // Show error message - no valid data found
        if (resourceBundle) {
          MessageToast.show(resourceBundle.getText('spreadsheetimporter.pasteNoData'));
        }
      }
    } catch (error) {
      Log.error('Error handling paste event', error as Error, 'SpreadsheetDialog');

      // Check for specific error types
      const resourceBundle = (this.getModel('i18n') as ResourceModel)?.getResourceBundle() as ResourceBundle;
      if (resourceBundle) {
        const errorMessage = (error as Error).message;
        if (errorMessage === 'pasteTooLarge') {
          MessageToast.show(resourceBundle.getText('spreadsheetimporter.pasteTooLarge'));
        } else {
          MessageToast.show(resourceBundle.getText('spreadsheetimporter.pasteError'));
        }
      }
    } finally {
      this.setBusy(false);
    }
  }

  private showDropMessage(show: boolean) {
    // Ensure the current state matches the desired visibility
    if (this.dropMessageShown === show) {
      return; // No change is needed if the state is already correct
    }

    let dropMessage = this.getDomRef().querySelector('.drop-message');
    if (!dropMessage) {
      // Create the message element if it doesn't exist
      dropMessage = document.createElement('div');
      dropMessage.className = 'drop-message';
      dropMessage.textContent = ((this.getModel('i18n') as ResourceModel).getResourceBundle() as ResourceBundle).getText(
        'spreadsheetimporter.dropMessage'
      );
      this.getDomRef().appendChild(dropMessage);
    }

    // Toggle visibility class based on the 'show' parameter
    dropMessage.classList.toggle('visible', show);
    // Update the flag to reflect the new state
    this.dropMessageShown = show;
  }

  public setDecimalSeparator(sDecimalSeparator: string) {
    if (sDecimalSeparator === ',' || sDecimalSeparator === '.') {
      this.setProperty('decimalSeparator', sDecimalSeparator);
      this.fireDecimalSeparatorChanged({ decimalSeparator: sDecimalSeparator } as SpreadsheetDialog$DecimalSeparatorChangedEventParameters);
      return this;
    } else {
      throw new Error("Decimal separator must be either ',' or '.'");
    }
  }

  public setAvailableOptions(aAvailableOptions: AvailableOptions[]) {
    for (let option of aAvailableOptions) {
      if (!Object.values(AvailableOptions).includes(option as AvailableOptions)) {
        throw new Error('Invalid option: ' + option);
      }
    }
    this.setProperty('availableOptions', aAvailableOptions);
    this.fireAvailableOptionsChanged({ availableOptions: aAvailableOptions }) as SpreadsheetDialog$AvailableOptionsChangedEventParameters;
    return this;
  }

  /**
   * Fire the dataPaste event
   * @param parameters - Event parameters
   * @returns this
   */
  public fireDataPaste(parameters?: SpreadsheetDialog$DataPasteEventParameters): this {
    return this.fireEvent('dataPaste', parameters) as this;
  }

  exit() {
    // Remove event listeners to clean up
    const domRef = this.getDomRef();
    if (domRef) {
      domRef.removeEventListener('dragover', this.handleDragOver.bind(this), false);
      domRef.removeEventListener('dragleave', this.handleDragLeave.bind(this), false);
      domRef.removeEventListener('drop', this.handleFileDrop.bind(this), false);

      // Remove paste event listener using stable reference
      domRef.removeEventListener('paste', this._onPaste);
    }

    // Clean up the drop message element if needed
    let dropMessage = domRef?.querySelector('.drop-message');
    if (dropMessage) {
      dropMessage.remove();
    }
    this.dropMessageShown = false; // Reset visibility flag
    super.exit();
  }

  static renderer: typeof SpreadsheetDialogRenderer = SpreadsheetDialogRenderer;
}
