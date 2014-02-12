#import <Foundation/Foundation.h>

@interface TaskItem : NSObject

@property NSString *itemTitle;
@property BOOL completed;
@property (readonly) NSDate *creationDate;
@property (readonly) NSDate *completedDate;

@end
