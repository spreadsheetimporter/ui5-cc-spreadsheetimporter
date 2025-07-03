import Dialog from 'sap/m/Dialog';
import type { MetadataOptions } from 'sap/ui/core/Element';
import { AvailableOptions } from '../enums';
import SpreadsheetDialogRenderer from './SpreadsheetDialogRenderer';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
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
  constructor(id?: string | $SpreadsheetDialogSettings);
  constructor(id?: string, settings?: $SpreadsheetDialogSettings);
  constructor(id?: string, settings?: $SpreadsheetDialogSettings) {
    super(id, settings);
    this.dropMessageShown = false;
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
    domRef.addEventListener('dragover', this.handleDragOver.bind(this), false);
    domRef.addEventListener('dragenter', this.handleDragEnter.bind(this), false);
    domRef.addEventListener('dragleave', this.handleDragLeave.bind(this), false);
    domRef.addEventListener('drop', this.handleFileDrop.bind(this), false);
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

  exit() {
    // Remove event listeners to clean up
    const domRef = this.getDomRef();
    if (domRef) {
      domRef.removeEventListener('dragover', this.handleDragOver.bind(this), false);
      domRef.removeEventListener('dragleave', this.handleDragLeave.bind(this), false);
      domRef.removeEventListener('drop', this.handleFileDrop.bind(this), false);
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
