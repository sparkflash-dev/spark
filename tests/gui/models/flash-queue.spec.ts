import { expect } from 'chai';

// We test the FlashQueue class directly by importing the module
// The singleton is exported, but we can test through it
import { flashQueue } from '../../../lib/gui/app/models/flash-queue';

describe('FlashQueue', function () {
	beforeEach(function () {
		flashQueue.clear();
	});

	describe('add()', function () {
		it('should add an item to the queue', function () {
			const item = flashQueue.add('/tmp/test.img', 'test.img', 1024);
			expect(item.imagePath).to.equal('/tmp/test.img');
			expect(item.imageName).to.equal('test.img');
			expect(item.status).to.equal('pending');
		});

		it('should assign unique IDs', function () {
			const item1 = flashQueue.add('/tmp/a.img', 'a.img');
			const item2 = flashQueue.add('/tmp/b.img', 'b.img');
			expect(item1.id).to.not.equal(item2.id);
		});
	});

	describe('remove()', function () {
		it('should remove a pending item', function () {
			const item = flashQueue.add('/tmp/test.img', 'test.img');
			expect(flashQueue.remove(item.id)).to.be.true;
			expect(flashQueue.getAll()).to.have.length(0);
		});

		it('should not remove a non-pending item', function () {
			const item = flashQueue.add('/tmp/test.img', 'test.img');
			flashQueue.markStarted(item.id);
			expect(flashQueue.remove(item.id)).to.be.false;
		});

		it('should return false for non-existent ID', function () {
			expect(flashQueue.remove('999')).to.be.false;
		});
	});

	describe('lifecycle', function () {
		it('should track item through full lifecycle', function () {
			const item = flashQueue.add('/tmp/test.img', 'test.img');

			flashQueue.markStarted(item.id);
			expect(flashQueue.getAll()[0].status).to.equal('flashing');
			expect(flashQueue.isActive()).to.be.true;

			flashQueue.markCompleted(item.id);
			expect(flashQueue.getAll()[0].status).to.equal('completed');
			expect(flashQueue.isActive()).to.be.false;
		});

		it('should handle failed items', function () {
			const item = flashQueue.add('/tmp/test.img', 'test.img');
			flashQueue.markStarted(item.id);
			flashQueue.markFailed(item.id, 'write error');

			const queue = flashQueue.getAll();
			expect(queue[0].status).to.equal('failed');
			expect(queue[0].error).to.equal('write error');
		});
	});

	describe('summary()', function () {
		it('should return correct counts', function () {
			flashQueue.add('/tmp/a.img', 'a.img');
			flashQueue.add('/tmp/b.img', 'b.img');
			const item3 = flashQueue.add('/tmp/c.img', 'c.img');
			flashQueue.markStarted(item3.id);
			flashQueue.markCompleted(item3.id);

			const summary = flashQueue.summary();
			expect(summary.total).to.equal(3);
			expect(summary.pending).to.equal(2);
			expect(summary.completed).to.equal(1);
			expect(summary.failed).to.equal(0);
		});
	});

	describe('getNext()', function () {
		it('should return first pending item', function () {
			const item1 = flashQueue.add('/tmp/a.img', 'a.img');
			flashQueue.add('/tmp/b.img', 'b.img');
			expect(flashQueue.getNext()!.id).to.equal(item1.id);
		});

		it('should skip non-pending items', function () {
			const item1 = flashQueue.add('/tmp/a.img', 'a.img');
			const item2 = flashQueue.add('/tmp/b.img', 'b.img');
			flashQueue.markStarted(item1.id);
			flashQueue.markCompleted(item1.id);
			expect(flashQueue.getNext()!.id).to.equal(item2.id);
		});

		it('should return undefined when queue is empty', function () {
			expect(flashQueue.getNext()).to.be.undefined;
		});
	});

	describe('events', function () {
		it('should emit item-added event', function () {
			const events: string[] = [];
			const unsub = flashQueue.on((event) => events.push(event));
			flashQueue.add('/tmp/test.img', 'test.img');
			expect(events).to.include('item-added');
			unsub();
		});

		it('should emit queue-completed when all items done', function () {
			const events: string[] = [];
			const unsub = flashQueue.on((event) => events.push(event));
			const item = flashQueue.add('/tmp/test.img', 'test.img');
			flashQueue.markStarted(item.id);
			flashQueue.markCompleted(item.id);
			expect(events).to.include('queue-completed');
			unsub();
		});

		it('should unsubscribe correctly', function () {
			const events: string[] = [];
			const unsub = flashQueue.on((event) => events.push(event));
			unsub();
			flashQueue.add('/tmp/test.img', 'test.img');
			expect(events).to.have.length(0);
		});
	});

	describe('clear()', function () {
		it('should remove all items', function () {
			flashQueue.add('/tmp/a.img', 'a.img');
			flashQueue.add('/tmp/b.img', 'b.img');
			flashQueue.clear();
			expect(flashQueue.getAll()).to.have.length(0);
			expect(flashQueue.isActive()).to.be.false;
		});
	});
});
