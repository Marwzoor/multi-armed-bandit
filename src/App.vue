<template>
	<div id="app">
		<h1>Multi-armed bandit problem</h1>
		<div class="bandits">
			<div :class="['bandit', {'current': index === lastBandit}]" v-for="(bandit, index) in bandits" :key="index">
				<div class="bandit-display">
					<span class="bandit-display-text won" v-show="bandit.status === 'won'">$$ WON $$</span>
					<span class="bandit-display-text lost" v-show="bandit.status === 'lost'">LOST</span>
				</div>
				<p>Number of tries: {{ bandit.count }}</p>
				<p>Winning chance: {{ bandit.chance }}%</p>
				<div class="bandit-arm"></div>
			</div>
		</div>
		<div class="actions">
			<p>Rounds left: {{ roundsLeft }}</p>
			<p>Wins: {{ score }}</p>
			<button @click.prevent="runRL">Run (Reinforcement Learning)</button>
			<button @click.prevent="runRandom">Run (Random)</button>
		</div>
	</div>
</template>

<script>
const { jStat } = require('jstat');

export default {
	name: 'App',
	components: {
		
	},

	data () {
		const bandits = [
			{
				chance: 20 + Math.round(Math.random() * 70),
				count: 0,
				status: ''
			},
			{
				chance: 20 + Math.round(Math.random() * 70),
				count: 0,
				status: ''
			},
			{
				chance: 20 + Math.round(Math.random() * 70),
				count: 0,
				status: ''
			},
			{
				chance: 20 + Math.round(Math.random() * 70),
				count: 0,
				status: ''
			}
		];

		const rewards0 = [];
		const rewards1 = [];

		for (let i=0;i<bandits.length;++i) {
			rewards0.push(0);
			rewards1.push(0);
		}

		return {
			bandits: bandits,
			roundsLeft: 0,
			score: 0,

			thompsonSampling: {
				rewards0: rewards0,
				rewards1: rewards1
			},

			lastBandit: false
		};
	},

	methods: {
		runRL() {
			this.roundsLeft = 100;
			this.resetBandits();
			this.score = 0;

			this.stepRL();
		},

		runRandom() {
			this.roundsLeft = 100;
			this.resetBandits();
			this.score = 0;

			this.stepRandom();
		},

		resetBandits() {
			for (let i=0;i<this.bandits.length;++i) {
				this.bandits[i].count = 0;
				this.bandits[i].status = '';
			}

			this.lastBandit = false;
		},

		stepRandom() {
			const banditIndex = Math.round(Math.random() * (this.bandits.length - 1));

			const result = this.testBandit(banditIndex);

			if (result) {
				++this.score;
			}

			this.lastBandit = banditIndex;

			--this.roundsLeft;

			if (this.roundsLeft > 0) {
				setTimeout(this.stepRandom, 100);
			}
		},

		stepRL() {
			let banditIndex = 0;
			let maxRandom = 0;

			for (let i=0;i<this.bandits.length;++i) {
				const randomBeta = jStat.beta.sample(this.thompsonSampling.rewards1[i] + 1, this.thompsonSampling.rewards0[i] + 1);

				if (randomBeta > maxRandom) {
					maxRandom = randomBeta;
					banditIndex = i;
				}
			}

			this.lastBandit = banditIndex;

			const result = this.testBandit(banditIndex);

			if (result) {
				this.thompsonSampling.rewards1[banditIndex] += 1;

				++this.score;
			} else {
				this.thompsonSampling.rewards0[banditIndex] += 1;
			}

			--this.roundsLeft;

			if (this.roundsLeft > 0) {
				setTimeout(this.stepRL, 100);
			}
		},

		testBandit(banditIndex) {
			const bandit = this.bandits[banditIndex];

			const result = Math.random() * 100 <= bandit.chance;

			if (result) {
				bandit.status = 'won';
			} else {
				bandit.status = 'lost';
			}

			++bandit.count;

			return result;
		}
	}
};
</script>

<style>
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
	margin: 0;
	padding: 0;
}

h1 {
	text-align: center;
}

#app {
	font-family: 'Lato', sans-serif;
}

.bandits {
	display: flex;
	justify-content: space-around;
}

.bandit {
    flex-grow: 1;
    text-align: center;
    height: 200px;
    padding: 20px 20px;
    background-color: #ededed;
    margin: 0 40px;
	border-radius: 20px;
	position: relative;
	width: 100%;
	max-width: 160px;
}

.bandit-arm {
	position: absolute;
    left: 100%;
    height: 100px;
    width: 20px;
    background-color: #b5b5b5;
	bottom: 50px;
	border-bottom-right-radius: 20px;
}

.bandit-arm:after {
	content: '';
    display: block;
    width: 40px;
    height: 40px;
    background-color: #fb5454;
    border-radius: 50%;
    position: absolute;
    top: -30px;
    left: -10px;
}

.bandit-display {
    height: 100px;
	background-color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
}

.bandit-display-text {
    font-size: 24px;
}

.bandit-display-text.won {
    color: green;
}

.bandit-display-text.lost {
    color: red;
}

.bandit.current .bandit-display {
    background-color: #d9d9d9;
}

.actions {
	text-align: center;
	margin-top: 20px;
}

.actions button {
	background-color: #2672d0;
	border: none;
	font-size: 16px;
	margin: 0 10px;
	color: #fff;
	padding: 10px 20px;
	border-radius: 20px;
	cursor: pointer;
	transition: all .2s ease-in-out;
}

.actions button:hover {
	background-color: #0b61cc;
}
</style>
