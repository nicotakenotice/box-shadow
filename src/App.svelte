<script>
  import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';

  const defaultValues = {
		boxColor: '#85b6ff',
		bgColor: '#ffffff',
		shadowInset: false,
		shadowX: 0,
		shadowY: 4,
		shadowBlur: 10,
		shadowSpread: 0,
		shadowColor: '#8f8f8f'
	};

	let boxColor = defaultValues.boxColor;
	let bgColor = defaultValues.bgColor;
	let shadowInset = defaultValues.shadowInset;
	let shadowX = defaultValues.shadowX;
	let shadowY = defaultValues.shadowY;
	let shadowBlur = defaultValues.shadowBlur;
	let shadowSpread = defaultValues.shadowSpread;
	let shadowColor = defaultValues.shadowColor;

  $: boxShadow = `${shadowInset ? 'inset ': ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;

  function copyToClipboard() {
    const element = document.getElementById('css-box');
    navigator.clipboard.writeText(element.innerText);
  }
</script>

<div class="d-flex flex-column min-vh-100 font-monospace">
  <Header></Header>

  <main class="flex-grow-1">
    <!-- Canvas -->
    <div id="canvas" class="position-relative shadow" style="background-color: {bgColor}">
      <div 
        id="box" 
        class="rounded"
        style="background-color: {boxColor}; box-shadow: {boxShadow}">
      </div>

      <div id="inset-box">
        <input type="checkbox" class="form-check-input" bind:checked="{shadowInset}">
        <span class="label">inset</span>
      </div>
    </div>

    <div class="container-fluid py-4">
      <div class="row">
        <!-- X offset -->
        <div class="col-6 col-md-3">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">x-offset</div>
            <div class="number-box ms-auto">{shadowX}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => shadowX = defaultValues.shadowX}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div><input type="range" class="form-range" min="-50" max="50" bind:value="{shadowX}"></div>
        </div>

        <!-- Y offset -->
        <div class="col-6 col-md-3">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">y-offset</div>
            <div class="number-box ms-auto">{shadowY}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => shadowY = defaultValues.shadowY}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div><input type="range" class="form-range" min="-50" max="50" bind:value="{shadowY}"></div>
        </div>

        <!-- Blur -->
        <div class="col-6 col-md-3">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">blur</div>
            <div class="number-box ms-auto">{shadowBlur}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => shadowBlur = defaultValues.shadowBlur}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div><input type="range" class="form-range" min="0" max="50" bind:value="{shadowBlur}"></div>
        </div>

        <!-- Spread -->
        <div class="col-6 col-md-3">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">spread</div>
            <div class="number-box ms-auto">{shadowSpread}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => shadowSpread = defaultValues.shadowSpread}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div><input type="range" class="form-range" min="-50" max="50" bind:value="{shadowSpread}"></div>
        </div>

        <!-- Shadow color -->
        <div class="col-12 col-sm-4">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">shadow</div>
            <div class="hex-box ms-auto">{shadowColor}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => shadowColor = defaultValues.shadowColor}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div class="mt-1"><input type="color" bind:value="{shadowColor}"></div>
        </div>

        <!-- Box color -->
        <div class="col-12 col-sm-4">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">box</div>
            <div class="hex-box ms-auto">{boxColor}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => boxColor = defaultValues.boxColor}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div class="mt-1"><input type="color" bind:value="{boxColor}"></div>
        </div>

        <!-- Background color -->
        <div class="col-12 col-sm-4">
          <div class="d-flex flex-row align-items-center">
            <div class="label ellipsis">background</div>
            <div class="hex-box ms-auto">{bgColor}</div>
            <div class="reset-icon ms-2" title="Reset" on:click="{() => bgColor = defaultValues.bgColor}">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
          </div>
          <div class="mt-1"><input type="color" bind:value="{bgColor}"></div>
        </div>
      </div>

      <!-- Code -->
      <div class="position-relative bg-gray rounded p-2 mt-4">
        <pre id="css-box" class="mb-0">
#box &lcub;
  <span style="color: var(--bs-purple)">background-color</span>: <span style="color: var(--bs-green)">{boxColor}</span>;
  <span style="color: var(--bs-purple)">box-shadow</span>: <span style="color: var(--bs-green)">{boxShadow}</span>;
&rcub;
        </pre>

        <div id="copy-icon" title="Copy to clipboard" on:click="{() => copyToClipboard()}">
          <i class="bi bi-clipboard"></i>
        </div>
      </div>
    </div>
  </main>

  <Footer></Footer>
</div>

<style>
  #canvas {
		display: grid;
		place-items: center;
		height: 300px;
	}
	#box {
		width: 80%;
		max-width: 200px;
		height: 150px;
	}
  .label {
    font-size: 0.8rem;
    text-transform: uppercase;
  }
  #inset-box {
    position: absolute;
    bottom: 0.25rem;
  }
  .number-box {
    width: 40px;
    font-weight: bold;
    text-align: right;
  }
  .hex-box {
    width: 80px;
    font-weight: bold;
    text-align: right;
  }
  .reset-icon {
    display: grid;
    place-items: center;
    width: 25px;
    height: 25px;
    border: 1px solid #dee2e6;
    border-radius: 50%;
    cursor: pointer;
  }
  .reset-icon:hover { background-color: #eeeeee; }
  .reset-icon:active { background-color: #dddddd; }
  #copy-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    cursor: pointer;
  }
  #copy-icon:hover { color: #0d6efd; }
  #copy-icon:active { color: #0a58ca; }
  input[type=color] {
    width: 100%;
    height: 1.5rem;
    padding: 1px;
    background-color: var(--bs-dark);
    border-radius: 2px;
  }
</style>
