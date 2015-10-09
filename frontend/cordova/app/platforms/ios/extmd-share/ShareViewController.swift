//
//  ShareViewController.swift
//  extmd-share
//
//  Created by Timo Tiuraniemi on 07/10/15.
//
//

import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {

    var linkUrl: String?
    var linkTitle: String?
    var inboxId: String?
    var processingData: Bool = false
    
    override func isContentValid() -> Bool {
        saveInboxIdLinkUrlAndTitle();
        if let inbox = self.inboxId, url = self.linkUrl, title = self.linkTitle where !inbox.isEmpty && !url.isEmpty && !title.isEmpty{
            return true
        }
        return false
    }

    override func didSelectPost() {
        if let inboxId = self.inboxId, linkUrl = self.linkUrl, linkTitle = self.linkTitle{
            let url = "https://ext.md/api/inbox/" + inboxId
            let escLinkUrl = self.encodeStringForHttpRequest(linkUrl)
            let escLinkTitle = self.encodeStringForHttpRequest(linkTitle)
            let postData = ("Subject=" + escLinkTitle + "&stripped-text=" + escLinkUrl).dataUsingEncoding(NSUTF8StringEncoding)
            let request = NSMutableURLRequest(URL: NSURL(string: url)!)
            request.HTTPMethod = "POST"
            request.HTTPBody = postData
            request.setValue(String(postData!.length), forHTTPHeaderField: "Content-Length")
            request.setValue("application/x-www-form-urlencoded;charset=utf-8", forHTTPHeaderField: "Content-Type")
            let task = NSURLSession.sharedSession().dataTaskWithRequest(request) {
                data, response, error in
                if (error != nil || (response! as! NSHTTPURLResponse).statusCode != 200) {
                    self.alertError("Could not save link, are you online?", onOKPressed: self.closeExtension)
                }else{
                    // print(NSString(data: data!, encoding: NSUTF8StringEncoding))
                    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
                    self.extensionContext!.completeRequestReturningItems([], completionHandler: nil)
                }
            }
            task.resume()
        }
        
    }
    
    override func configurationItems() -> [AnyObject]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func presentationAnimationDidFinish(){
        if (self.inboxId == nil){
            self.alertError("Account not created or connected. Sign up or log in to your extended mind account and retry.", onOKPressed: self.closeExtension)
            self.textView.resignFirstResponder()
        }else if (self.linkTitle == nil || self.linkUrl == nil){
            self.alertError("Could not find information from shared link", onOKPressed: self.closeExtension)
            self.textView.resignFirstResponder()
        }
    }
    
    private func saveInboxIdLinkUrlAndTitle(){
        if (!self.processingData){
            self.processingData = true
            
            let defaults = NSUserDefaults.init(suiteName: "group.org.extendedmind")
            if let emDefaults = defaults{
                if let inbox = emDefaults.stringForKey("inboxId") where !inbox.isEmpty{
                    self.inboxId = inbox
                }
            }
            
            let content = extensionContext!.inputItems[0] as! NSExtensionItem
            let contentType = kUTTypePropertyList as String
            
            for attachment in content.attachments as! [NSItemProvider] {
                if attachment.hasItemConformingToTypeIdentifier(contentType) {
                    attachment.loadItemForTypeIdentifier(contentType, options: nil) { data, error in
                        if error == nil {
                            let jsDict = data as! NSDictionary
                            if let jsPreprocessingResults = jsDict[NSExtensionJavaScriptPreprocessingResultsKey] {
                                self.linkUrl = jsPreprocessingResults["url"] as? String
                                self.linkTitle = jsPreprocessingResults["title"] as? String
                                super.validateContent()
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func alertError(errorText: String, onOKPressed: () -> Void){
        let alert = UIAlertController(title: "Error", message: errorText, preferredStyle: .Alert)
        let action = UIAlertAction(title: "OK", style: .Cancel) { _ in
            self.dismissViewControllerAnimated(true, completion: nil)
            onOKPressed()
        }
        
        alert.addAction(action)
        self.presentViewController(alert, animated: true, completion: nil)
    }
    
    private func closeExtension() -> Void {
        super.cancel()
    }
    
    // From http://stackoverflow.com/a/19263420/2659424
    private func encodeStringForHttpRequest(string: String) -> String{
        let result = CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault,
                    string as CFStringRef,
                    " " as CFStringRef,
                    ":/?@!$&'()*+,;=" as CFStringRef,
                    CFStringBuiltInEncodings.UTF8.rawValue) as String
        return result.stringByReplacingOccurrencesOfString(" ", withString: "+")
    }

}
