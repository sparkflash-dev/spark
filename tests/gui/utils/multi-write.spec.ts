import { expect } from 'chai';
import { MultiWriteManager } from '../../../lib/gui/app/utils/multi-write';

describe('MultiWriteManager', function () {
	const options = {
		imagePath: '/tmp/test.iso',
		targets: [
			{ device: '/dev/sdb', name: 'Drive 1', size: 8e9 },
			{ device: '/dev/sdc', name: 'Drive 2', size: 16e9 },
		],
		verify: true,
	};

	it('should initialize with all targets', function () {
		const mgr = new MultiWriteManager(options);
		const status = mgr.getStatus();
		expect(status).to.have.lengthOf(2);
		expect(status[0].device).to.equal('/dev/sdb');
		expect(status[1].device).to.equal('/dev/sdc');
	});

	it('should start with writing phase', function () {
		const mgr = new MultiWriteManager(options);
		const status = mgr.getStatus();
		expect(status.every((s) => s.phase === 'writing')).to.be.true;
	});

	it('should report active when writes in progress', function () {
		const mgr = new MultiWriteManager(options);
		expect(mgr.isActive()).to.be.true;
	});

	it('should update progress for specific device', function () {
		const mgr = new MultiWriteManager(options);
		mgr.updateProgress('/dev/sdb', { percentage: 50, speed: 30e6 });
		const status = mgr.getStatus();
		const sdb = status.find((s) => s.device === '/dev/sdb');
		expect(sdb!.percentage).to.equal(50);
		expect(sdb!.speed).to.equal(30e6);
	});

	it('should emit complete when all done', function (done) {
		const mgr = new MultiWriteManager(options);
		mgr.on('complete', (result) => {
			expect(result.total).to.equal(2);
			expect(result.successful).to.equal(1);
			expect(result.failed).to.equal(1);
			done();
		});
		mgr.markComplete('/dev/sdb');
		mgr.markFailed('/dev/sdc', 'Write error');
	});

	it('should not be active after all complete', function () {
		const mgr = new MultiWriteManager(options);
		mgr.markComplete('/dev/sdb');
		mgr.markComplete('/dev/sdc');
		expect(mgr.isActive()).to.be.false;
	});

	it('should emit cancelled on cancel', function (done) {
		const mgr = new MultiWriteManager(options);
		mgr.on('cancelled', () => done());
		mgr.cancel();
	});
});
