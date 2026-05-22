import { expect } from 'chai';
import { createFlashCompleteNotification, createDriveDetectedNotification, createVerificationNotification, createQueueNotification } from '../../../lib/gui/app/utils/notification-manager';

describe('Notification Manager', () => {
  it('should create success notification', () => {
    const notif = createFlashCompleteNotification('ubuntu.iso', 'USB Drive', '2m 30s', true);
    expect(notif.title).to.equal('Flash Complete');
    expect(notif.body).to.include('ubuntu.iso');
    expect(notif.sound).to.be.true;
  });

  it('should create failure notification with retry action', () => {
    const notif = createFlashCompleteNotification('image.iso', 'Drive', '0s', false);
    expect(notif.title).to.equal('Flash Failed');
    expect(notif.urgency).to.equal('critical');
    expect(notif.actions!.some((a) => a.action === 'retry')).to.be.true;
  });

  it('should create drive detected notification', () => {
    const notif = createDriveDetectedNotification('SanDisk Ultra', '32 GB');
    expect(notif.body).to.include('SanDisk Ultra');
    expect(notif.urgency).to.equal('low');
  });

  it('should create verification notifications', () => {
    const pass = createVerificationNotification(true);
    expect(pass.title).to.include('Passed');
    const fail = createVerificationNotification(false);
    expect(fail.urgency).to.equal('critical');
  });

  it('should create queue progress notification', () => {
    const mid = createQueueNotification(3, 5);
    expect(mid.title).to.include('3/5');
    const done = createQueueNotification(5, 5);
    expect(done.body).to.include('All drives');
  });
});
