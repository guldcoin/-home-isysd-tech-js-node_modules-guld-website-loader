const head = document.getElementsByTagName("head")[0]
window.stylesheets = []
window.scripts = [
    '/tech/js/node_modules/jquery/dist/jquery.min.js',
    '/tech/js/node_modules/popper.js/packages/popper/dist/umd/popper.min.js',
    '/tech/js/node_modules/bootstrap/dist/js/bootstrap.min.js',
    '/tech/js/node_modules/openpgp/dist/openpgp.min.js',
    '/tech/js/node_modules/marked/marked.min.js',
    '/tech/js/node_modules/load-html-component/load-html-component.js',
    '/tech/js/node_modules/password-modal/password-modal.js',
    '/tech/js/node_modules/guld-website-loader/guld-website-loader.js'
]

window.loadScript = function (src, stype="text/javascript") {
  if (window.scripts.indexOf(src) > -1) return
  var script = document.createElement("script")
  script.type = stype
  script.src = src
  head.appendChild(script)
  window.scripts.push(src)
}

window.loadCSS = function (src) {
  if (window.stylesheets.indexOf(src) > -1) return
  var link = document.createElement('link')
  link.rel  = 'stylesheet'
  link.href = src
  head.appendChild(link)
  window.stylesheets.push(src)
}

window.loadDocument = async function (url) {
  var query
  if (url === undefined) {
    query = window.location.search
  } else if (url.indexOf('?') > 0) {
    query = url.replace(/^[^?]*/, '')
  } else {
    query = url
  }
  let urlParams = new URLSearchParams(query);
  var toload = urlParams.get('toload') || url.replace(new RegExp(`(http\:|https\:)*//${window.location.host}`), '').split('?')[0]
  var loadtoel = urlParams.get('loadtoel') || 'content'
  var options = {
    eid: loadtoel
  }
  if (toload === undefined || toload === '/') return
  else if (toload.endsWith('.html') || toload.endsWith('.md')) {
    return loadHTMLComponent(toload, options)
  } else if (toload.endsWith('.aes')) {
    options.error = function (e) {
      console.error(e)
      $('#password-modal-center').modal('show')
    }
    initPasswordModal(async function (e) {
      e.preventDefault()
      $('#password-modal-center').modal('hide')
      options.password = document.getElementById('password').value
      if (toload.match(/\/Documents\/.*slides\/.*\.html\.aes/)) options.popup = true
      await loadHTMLComponent(toload, options)
    }, loadtoel)
  }
}

window.loadFromSitemap = function () {
  return fetch('/sitemap.txt').then(async response => {
    let sitemap = await response.text()
    let lines = sitemap.split('\n')
    let next
    for (var l in lines) {
      lines[l] = lines[l].replace(new RegExp(`(http\:|https\:)*//${window.location.host}`), '')
      if (lines[l].endsWith('.js')) loadScript(lines[l])
      else if (lines[l].endsWith('.css')) loadCSS(lines[l])
      else if (lines[l].match(/\/Documents\/.*html\/components\/.*\.html/)) await loadDocument(lines[l])
      else if (lines[l] === `${window.location.pathname}`) {
        next = lines[Number(l)+1]
        break
      }
    }
    if (window.location.pathname === '/' && window.location.search === '') return loadDocument(next)
    else return loadDocument(window.location.href)
  }).catch(e => {
    console.error(e) // eslint-disable-line
  })
}

$(document).ready(function() {
  loadFromSitemap()
})

