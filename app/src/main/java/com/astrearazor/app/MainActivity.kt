
package com.astrearazor.app

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.widget.Toast
import java.io.IOException

class MainActivity : Activity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        setContentView(webView)

        try {
            val html = assets.open("index.html")
                .bufferedReader()
                .use { it.readText() }

            webView.loadDataWithBaseURL(
                "http://192.168.4.1/",
                html,
                "text/html",
                "UTF-8",
                null
            )
        } catch (e: IOException) {
            Toast.makeText(
                this,
                "File index.html tidak ditemukan",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
