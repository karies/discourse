import { on } from 'ember-addons/ember-computed-decorators';
import StringBuffer from 'discourse/mixins/string-buffer';
import { iconHTML } from 'discourse/helpers/fa-icon';
import LogsNotice from 'discourse/services/logs-notice';

export default Ember.Component.extend(StringBuffer, {
  rerenderTriggers: ['site.isReadOnly'],

  renderString: function(buffer) {
    let notices = [];

    if (this.site.get("isReadOnly")) {
      notices.push([I18n.t("read_only_mode.enabled"), 'alert-read-only']);
    }

    if (this.siteSettings.disable_emails) {
      notices.push([I18n.t("emails_are_disabled"), 'alert-emails-disabled']);
    }

    if (!_.isEmpty(this.siteSettings.global_notice)) {
      notices.push([this.siteSettings.global_notice, 'alert-global-notice']);
    }

    if (!LogsNotice.currentProp('hidden')) {
      notices.push([LogsNotice.currentProp('message'), 'alert-logs-notice', `<div class='close'>${iconHTML('times')}</div>`]);
    }

    if (notices.length > 0) {
      buffer.push(_.map(notices, n => {
        var html = `<div class='row'><div class='alert alert-info ${n[1]}'>`;
        if (n[2]) html += n[2];
        html += `${n[0]}</div></div>`;
        return html;
      }).join(""));
    }
  },

  @on('didInsertElement')
  _setupLogsNotice() {
    LogsNotice.current().addObserver('hidden', () => {
      this.rerenderString();
    });

    this.$().on('click.global-notice', '.alert-logs-notice .close', () => {
      LogsNotice.currentProp('text', '');
    });
  },

  @on('willDestroyElement')
  _teardownLogsNotice() {
    this.$().off('click.global-notice');
  }
});
