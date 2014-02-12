#import <UIKit/UIKit.h>

@interface InboxViewController : UITableViewController

@property NSMutableArray *taskItems;

- (IBAction)editTapped:(id)sender;
- (IBAction)unwindToTasks:(UIStoryboardSegue *)segue;

@end
