'use babel';

import BuildXbuildView from './build-xbuild-view';
import { CompositeDisposable } from 'atom';

export default {

  buildXbuildView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.buildXbuildView = new BuildXbuildView(state.buildXbuildViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.buildXbuildView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'build-xbuild:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.buildXbuildView.destroy();
  },

  serialize() {
    return {
      buildXbuildViewState: this.buildXbuildView.serialize()
    };
  },

  toggle() {
    console.log('BuildXbuild was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
