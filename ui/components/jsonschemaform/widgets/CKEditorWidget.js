import React from 'react'
import CKEditor from 'ckeditor4-react'

function CKEditorWidget(props) {
    const config = {
        mathJaxLib: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
        toolbarGroups: [
            { name: 'clipboard', groups: ['clipboard', 'undo'] },
            { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
            { name: 'links' },
            { name: 'insert' },
            { name: 'forms' },
            { name: 'tools' },
            { name: 'document', groups: ['mode', 'document', 'doctools'] },
            { name: 'others' },
            '/',
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
            {
                name: 'paragraph',
                groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
            },
            { name: 'styles' },
            { name: 'colors' },
            { name: 'about' },
        ],
        removeButtons: 'Underline',
        format_tags: 'p;h1;h2;h3;pre',
        removeDialogTabs: 'image:advanced;link:upload;link:advanced',
        autoGrow_onStartup: true,
        autoGrow_bottomSpace: 30,
        filebrowserUploadUrl: props.formContext.imageUploadUrl || '/images/upload',
        filebrowserUploadMethod: 'form',
    }

    // TODO: support disabled/readonly, required?

    return (
        <CKEditor 
            className="form-control"
            config={config}
            data={props.value} 
            onBlur={(event) => {
                let value = event.editor.getData() || undefined
                props.onBlur(props.id, value)
            }}
            onChange={(event) => {
                let value = event.editor.getData() || undefined
                props.onChange(value)
            }}
            onBeforeLoad={(CKEDITOR) => CKEDITOR.disableAutoInline = true}
        />
    )
}

CKEditorWidget.defaultProps = {
    autofocus: false,
}

export default CKEditorWidget