import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs/markdown-it-attrs.browser'

/* Белый список атрибутов у тегов */
const tagAttrsWhitelist = {
  common: ['id', 'class', 'title', 'lang', 'align', 'color'],
  a: ['href', 'target', 'rel', 'type'],
  img: ['alt', 'src', 'width', 'height'],
  ol: ['type', 'reversed', 'start'],
  ul: ['type']
}

/* Обработчик при рендере MarkDown в HTML */
const handler = (tokens) => {
  tokens.forEach((token) => {
    /* Удалить не разрешенные атрибуты у тегов */
    if (token.attrs && token.attrs.length) {
      let index = token.attrs.length - 1

      while (index >= 0) {
        const attrName = token.attrs[index][0]

        if (
          tagAttrsWhitelist[token.tag] !== undefined &&
          tagAttrsWhitelist[token.tag].indexOf(attrName) === -1 &&
          tagAttrsWhitelist.common.indexOf(attrName) === -1
        ) {
          token.attrs.splice(index, 1)
        }

        index -= 1
      }
    }

    if (token.type === 'link_open') {
      /* Создать глобальный обработчик ссылок */
      if (typeof window !== 'undefined' && typeof window.routerPushWrapper !== 'function') {
        window.routerPushWrapper = (el) => {
          const href = el.getAttribute('href')

          if (window.$nuxt && typeof href === 'string') {
            if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm.test(href)) {
              window.open(href, '_blank').focus()
            } else if (/^(tel:|mailto:)/.test(href)) {
              window.open(href, '_top')
            } else if (/.+\.[a-z0-9]+$/.test(href)) {
              window.open(href)
            } else {
              window.$nuxt.$router.push(href)
            }
          }
        }
      }

      /* Подключить обработчик ссылки */
      token.attrs.push(['onclick', 'window.routerPushWrapper(this); return false;'])
    }

    if (token.children && token.children.length) {
      handler(token.children)
    }
  })
}

const arrToStr = (src) => {
  return Array.isArray(src) ? src.join('') : (typeof src === 'string' ? src : '')
}

export default (context, inject) => {
  /* Создать парсер MD в HTML */
  const md = new MarkdownIt({
    breaks: true
  })

  /* Добавьте поддержку атрибутов в MD */
  md.use(markdownItAttrs)

  /* Удалить не разрешенные атрибуты у тегов */
  md.core.ruler.before(
    'linkify',
    'curly_attributes',
    (state) => {
      handler(state.tokens)
    }
  )

  inject('md', {
    /* Добавить глобальный расширенный парсер MD */
    markdownExtra (src) {
      return md.render(arrToStr(src))
        .replace(/[_]/g, '&nbsp;')
        .replace(/\\n/g, '<br>')
    },

    /* Добавить глобальный парсер удаляющий HTML */
    ignoreHtml (src) {
      return arrToStr(src)
        .replace(/(<(\/?[^>]+)>)/g, '')
        .replace('&nbsp;', ' ')
        .replace(/[ +]/g, ' ')
        .trim()
    },

    /* Добавить глобальный парсер заменяющий "_" в &nbsp; */
    srcToNbsp (src) {
      return arrToStr(src)
        .replace(/[_]/g, '&nbsp;')
        .replace(/\\n/g, '<br>')
    },

    /* Добавить глобальный парсер заменяющий "_" в пробелы */
    srcToSpace (src) {
      return arrToStr(src)
        .replace(/[_]/g, ' ')
        .replace(/\\n/g, ' ')
    }
  })
}
