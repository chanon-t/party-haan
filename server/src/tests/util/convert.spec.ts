import * as chai from 'chai';

import { Convert } from '../../util/convert';

describe('Convert Util', function () {

    describe('toRandomText()', () => {
        it('should return valid length', () => {
            const result = Convert.toRandomText(10);
            chai.expect(result).to.have.lengthOf(10);
        });
        it('should return valid characters', () => {
            const result = Convert.toRandomText(10);
            chai.expect(result).to.match(/[a-zA-Z0-9]{10}/);
        });
    });

    describe('toPageRange()', () => {
        it('should return first page limit by 10', () => {
            const result = Convert.toPageRange(1, 10);
            chai.expect(result).to.eql({                
                start: 0,
                limit: 10
            });
        });
        it('should return second page limit by 10', () => {
            const result = Convert.toPageRange(2, 10);
            chai.expect(result).to.eql({                
                start: 10,
                limit: 10
            });
        });
        it('should return first page when page less than or equal zero', () => {
            const result1 = Convert.toPageRange(0, 10);
            chai.expect(result1).to.eql({                
                start: 0,
                limit: 10
            });
            const result2 = Convert.toPageRange(-1, 10);
            chai.expect(result2).to.eql({                
                start: 0,
                limit: 10
            });
        });
        it('should return page limit by 100 when request limit greater than 100', () => {
            const result = Convert.toPageRange(1, 101);
            chai.expect(result).to.eql({                
                start: 0,
                limit: 100
            });
        });
    });

    describe('toHashPassword()', () => {
        it('should return hash password', () => {
            const result = Convert.toHashPassword('whitedog');
            chai.expect(result).to.have.lengthOf(68);
        });
        it('should return valid hash password when password is correct', () => {
            const result = Convert.toHashPassword('whitedog', 'AIZtovZqJQNywc5jr0WbR6szTNYW4ZD2aV5St/hhdlD1Lo9aeKEFs9CDWy+Md3ZwMQ==');
            chai.expect(result).to.equal('AIZtovZqJQNywc5jr0WbR6szTNYW4ZD2aV5St/hhdlD1Lo9aeKEFs9CDWy+Md3ZwMQ==');
        });
        it('should return difference hash password when password is not correct', () => {
            const result = Convert.toHashPassword('123456', 'AIZtovZqJQNywc5jr0WbR6szTNYW4ZD2aV5St/hhdlD1Lo9aeKEFs9CDWy+Md3ZwMQ==');
            chai.expect(result).to.not.equal('AIZtovZqJQNywc5jr0WbR6szTNYW4ZD2aV5St/hhdlD1Lo9aeKEFs9CDWy+Md3ZwMQ==');
        });
    });
});