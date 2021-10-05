load("@npm//@bazel/typescript:index.bzl", "ts_project")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "tests",
    srcs = glob(["*.spec.ts"]),
    tsconfig = {
       "include": ["*.spec.ts"],
       "compilerOptions": {
            "lib": ["es2020", "DOM"],
            "skipLibCheck": True,
            "types": ["jest-playwright-preset", "jest"]
       }
    },
    deps = [
        "@npm//@types/jest",
        "@npm//jest",
        "@npm//jest-playwright-preset",
        "@npm//playwright",
    ],
)
